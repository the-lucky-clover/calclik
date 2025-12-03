// License management for CalClik browser extension
// Handles validation, activation, and grace periods

const LICENSE_API = 'https://api.calclik.app'; // Your Cloudflare Worker URL
const VALIDATION_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days
const GRACE_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days
const HARD_CUTOFF = 45 * 24 * 60 * 60 * 1000; // 45 days

class LicenseManager {
  constructor() {
    this.licenseKey = null;
    this.licenseData = null;
    this.lastValidation = null;
  }

  // Initialize and load stored license
  async initialize() {
    const stored = await this.getStoredLicense();
    if (stored) {
      this.licenseKey = stored.licenseKey;
      this.licenseData = stored.licenseData;
      this.lastValidation = stored.lastValidation;
    }
    return this.isValid();
  }

  // Activate a new license key
  async activateLicense(licenseKey) {
    if (!licenseKey || !this.isValidFormat(licenseKey)) {
      throw new Error('Invalid license key format');
    }

    try {
      const response = await fetch(`${LICENSE_API}/api/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey })
      });

      const data = await response.json();

      if (!data.valid) {
        throw new Error(data.error || 'Invalid license key');
      }

      // Store license data
      this.licenseKey = licenseKey;
      this.licenseData = data;
      this.lastValidation = Date.now();

      await this.storeLicense();

      return {
        success: true,
        plan: data.plan,
        expiresAt: data.expiresAt
      };

    } catch (error) {
      console.error('License activation failed:', error);
      throw error;
    }
  }

  // Start free trial
  async startTrial(email) {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email address');
    }

    try {
      const response = await fetch(`${LICENSE_API}/api/trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to start trial');
      }

      // Auto-activate the trial license
      await this.activateLicense(data.licenseKey);

      return {
        success: true,
        licenseKey: data.licenseKey,
        expiresAt: data.expiresAt
      };

    } catch (error) {
      console.error('Trial activation failed:', error);
      throw error;
    }
  }

  // Check if license is currently valid
  isValid() {
    if (!this.licenseData) return false;

    const now = Date.now();
    const expiresAt = new Date(this.licenseData.expiresAt).getTime();

    // Check expiration
    if (now > expiresAt) {
      return false;
    }

    // Check if validation is needed
    if (this.needsValidation()) {
      // Still valid in grace period
      const daysSinceValidation = (now - this.lastValidation) / (24 * 60 * 60 * 1000);
      return daysSinceValidation < 45; // Hard cutoff at 45 days offline
    }

    return true;
  }

  // Check if online validation is needed
  needsValidation() {
    if (!this.lastValidation) return true;
    const daysSinceValidation = (Date.now() - this.lastValidation) / (24 * 60 * 60 * 1000);
    return daysSinceValidation >= 7;
  }

  // Perform online validation
  async validateOnline() {
    if (!this.licenseKey) {
      return { valid: false, error: 'No license key' };
    }

    try {
      const response = await fetch(`${LICENSE_API}/api/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: this.licenseKey })
      });

      const data = await response.json();

      if (data.valid) {
        this.licenseData = data;
        this.lastValidation = Date.now();
        await this.storeLicense();
      } else {
        // License invalid - clear it
        await this.clearLicense();
      }

      return data;

    } catch (error) {
      console.error('Online validation failed:', error);
      // Network error - continue with grace period
      return { 
        valid: this.isValid(), 
        error: 'Network error', 
        offline: true 
      };
    }
  }

  // Get license status for UI
  getStatus() {
    if (!this.licenseData) {
      return {
        activated: false,
        valid: false,
        plan: null,
        expiresAt: null,
        daysRemaining: 0,
        needsRenewal: false,
        inGracePeriod: false
      };
    }

    const now = Date.now();
    const expiresAt = new Date(this.licenseData.expiresAt).getTime();
    const daysRemaining = Math.ceil((expiresAt - now) / (24 * 60 * 60 * 1000));
    const daysSinceValidation = this.lastValidation 
      ? Math.floor((now - this.lastValidation) / (24 * 60 * 60 * 1000))
      : 999;

    return {
      activated: true,
      valid: this.isValid(),
      plan: this.licenseData.plan,
      email: this.licenseData.email,
      expiresAt: this.licenseData.expiresAt,
      daysRemaining: Math.max(0, daysRemaining),
      needsRenewal: daysRemaining < 7,
      inGracePeriod: daysSinceValidation > 7 && daysSinceValidation < 45,
      daysSinceValidation,
      trial: this.licenseData.trial || false
    };
  }

  // Get features available for current license
  getFeatures() {
    if (!this.isValid()) {
      return {
        aiDetection: false,
        calendarIntegrations: false,
        crossBrowserSync: false,
        prioritySupport: false,
        message: 'Trial expired or no active subscription'
      };
    }

    return {
      aiDetection: true,
      calendarIntegrations: true,
      crossBrowserSync: true,
      prioritySupport: true,
      message: 'All features unlocked'
    };
  }

  // Deactivate current license
  async deactivate() {
    await this.clearLicense();
    this.licenseKey = null;
    this.licenseData = null;
    this.lastValidation = null;
  }

  // Helper: Check license key format
  isValidFormat(key) {
    return /^CLIK-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key);
  }

  // Helper: Validate email
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Storage methods
  async getStoredLicense() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['licenseKey', 'licenseData', 'lastValidation'], (result) => {
        if (chrome.runtime.lastError) {
          resolve(null);
        } else if (result.licenseKey) {
          resolve({
            licenseKey: result.licenseKey,
            licenseData: result.licenseData,
            lastValidation: result.lastValidation
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  async storeLicense() {
    return new Promise((resolve) => {
      chrome.storage.sync.set({
        licenseKey: this.licenseKey,
        licenseData: this.licenseData,
        lastValidation: this.lastValidation
      }, () => {
        resolve();
      });
    });
  }

  async clearLicense() {
    return new Promise((resolve) => {
      chrome.storage.sync.remove(['licenseKey', 'licenseData', 'lastValidation'], () => {
        resolve();
      });
    });
  }
}

// Export singleton instance
const licenseManager = new LicenseManager();

// Background task: Validate license periodically
if (typeof chrome !== 'undefined' && chrome.alarms) {
  // Check daily
  chrome.alarms.create('validateLicense', { periodInMinutes: 1440 });
  
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'validateLicense') {
      if (licenseManager.needsValidation()) {
        const result = await licenseManager.validateOnline();
        console.log('License validation:', result);
      }
    }
  });
}

// Initialize on startup
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onStartup.addListener(async () => {
    await licenseManager.initialize();
    
    // Validate if needed
    if (licenseManager.needsValidation()) {
      await licenseManager.validateOnline();
    }
  });

  chrome.runtime.onInstalled.addListener(async () => {
    await licenseManager.initialize();
  });
}

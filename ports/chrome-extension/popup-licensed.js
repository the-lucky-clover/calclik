// popup-licensed.js - Popup with license validation
// Handles UI for licensing + event scanning

let currentEvents = [];

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await checkLicenseStatus();
});

// Check license status and show appropriate screen
async function checkLicenseStatus() {
  const isValid = await licenseManager.initialize();
  const status = licenseManager.getStatus();
  
  if (!isValid || !status.activated) {
    // Show activation screen
    document.getElementById('activationScreen').style.display = 'block';
    document.getElementById('mainScreen').classList.remove('active');
  } else {
    // Show main app
    document.getElementById('activationScreen').style.display = 'none';
    document.getElementById('mainScreen').classList.add('active');
    updateLicenseBadge(status);
    
    // Auto-validate if needed
    if (licenseManager.needsValidation()) {
      const result = await licenseManager.validateOnline();
      if (!result.valid) {
        showActivationScreen();
      }
    }
  }
}

// Update license badge in header
function updateLicenseBadge(status) {
  const badge = document.getElementById('licenseBadge');
  
  if (status.trial) {
    badge.textContent = `Trial (${status.daysRemaining}d left)`;
    badge.style.background = 'rgba(255, 165, 0, 0.2)';
    badge.style.borderColor = 'rgba(255, 165, 0, 0.3)';
    badge.style.color = '#ffa500';
  } else if (status.inGracePeriod) {
    badge.textContent = 'Offline Mode';
    badge.style.background = 'rgba(255, 165, 0, 0.2)';
    badge.style.borderColor = 'rgba(255, 165, 0, 0.3)';
    badge.style.color = '#ffa500';
  } else {
    const planName = status.plan === 'annual' ? 'Annual' : 'Monthly';
    badge.textContent = planName;
  }
}

// Show license details modal
function showLicenseInfo() {
  const status = licenseManager.getStatus();
  
  const message = `
    <strong>License Status:</strong> ${status.valid ? 'Active' : 'Inactive'}<br>
    <strong>Plan:</strong> ${status.plan || 'None'}<br>
    <strong>Email:</strong> ${status.email || 'N/A'}<br>
    <strong>Expires:</strong> ${status.daysRemaining}d remaining<br>
    ${status.trial ? '<br><em>Trial period active</em>' : ''}
    ${status.inGracePeriod ? '<br><em>Please connect to internet to validate</em>' : ''}
  `;
  
  if (confirm(message + '\n\nManage subscription?')) {
    chrome.tabs.create({ url: 'https://calclik.app/account' });
  }
}

// Start free trial
async function startTrial() {
  const email = prompt('Enter your email for the 7-day free trial:');
  
  if (!email) return;
  
  showMessage('Starting trial...', 'loading');
  
  try {
    const result = await licenseManager.startTrial(email);
    
    showMessage(
      `Trial activated! License key sent to ${email}. Extension is now active.`,
      'success'
    );
    
    // Switch to main screen after 2 seconds
    setTimeout(() => {
      document.getElementById('activationScreen').style.display = 'none';
      document.getElementById('mainScreen').classList.add('active');
      checkLicenseStatus();
    }, 2000);
    
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

// Toggle license input section
function toggleLicenseInput() {
  const section = document.getElementById('licenseInputSection');
  section.classList.toggle('active');
}

// Activate license key
async function activateLicense() {
  const input = document.getElementById('licenseKeyInput');
  const licenseKey = input.value.trim().toUpperCase();
  
  if (!licenseKey) {
    showMessage('Please enter a license key', 'error');
    return;
  }
  
  showMessage('Validating license...', 'loading');
  
  try {
    const result = await licenseManager.activateLicense(licenseKey);
    
    showMessage('License activated successfully!', 'success');
    
    // Switch to main screen
    setTimeout(() => {
      document.getElementById('activationScreen').style.display = 'none';
      document.getElementById('mainScreen').classList.add('active');
      checkLicenseStatus();
    }, 1500);
    
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

// Show message in activation screen
function showMessage(message, type) {
  const container = document.getElementById('activationMessage');
  const className = type === 'error' ? 'error-message' : 
                    type === 'success' ? 'success-message' : 
                    'loading';
  
  container.innerHTML = `<div class="${className}">${message}</div>`;
  
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      container.innerHTML = '';
    }, 5000);
  }
}

// Show activation screen (when license expires/invalid)
function showActivationScreen() {
  document.getElementById('activationScreen').style.display = 'block';
  document.getElementById('mainScreen').classList.remove('active');
}

// Scan for events (main feature)
async function scanForEvents() {
  const features = licenseManager.getFeatures();
  
  if (!features.aiDetection) {
    alert('AI detection requires an active subscription. Please activate or renew your license.');
    showActivationScreen();
    return;
  }
  
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('scanBtn').disabled = true;
  
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to content script to scan page
    chrome.tabs.sendMessage(tab.id, { action: 'scanPage' }, (response) => {
      if (chrome.runtime.lastError) {
        showError('Failed to scan page. Please refresh and try again.');
        return;
      }
      
      if (response && response.text) {
        // Send to background for AI processing
        chrome.runtime.sendMessage(
          { action: 'processEvents', text: response.text },
          (aiResponse) => {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('scanBtn').disabled = false;
            
            if (aiResponse && aiResponse.events) {
              displayEvents(aiResponse.events);
            } else {
              showError('No events found on this page.');
            }
          }
        );
      } else {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('scanBtn').disabled = false;
        showError('No text found on page.');
      }
    });
    
  } catch (error) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('scanBtn').disabled = false;
    showError('Error scanning page: ' + error.message);
  }
}

// Display found events
function displayEvents(events) {
  currentEvents = events;
  const container = document.getElementById('events');
  
  if (!events || events.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #a1a1aa;">No events found</p>';
    return;
  }
  
  container.innerHTML = `
    <div style="background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 8px; padding: 10px; margin: 10px 0; text-align: center;">
      Found ${events.length} event${events.length > 1 ? 's' : ''}
    </div>
  `;
  
  events.forEach((event, index) => {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event';
    eventDiv.innerHTML = `
      <h4>${event.title}</h4>
      <p>📅 ${event.date} ${event.time ? `at ${event.time}` : ''}</p>
      ${event.location ? `<p>📍 ${event.location}</p>` : ''}
      ${event.description ? `<p>📝 ${event.description}</p>` : ''}
      
      <div class="calendar-options">
        <button class="calendar-btn" onclick="addToGoogleCalendar(${index})">
          Google Calendar
        </button>
        <button class="calendar-btn" onclick="addToOutlook(${index})">
          Outlook
        </button>
        <button class="calendar-btn" onclick="downloadICS(${index})">
          Download .ics
        </button>
        <button class="calendar-btn" onclick="addToReminders(${index})">
          macOS Reminders
        </button>
      </div>
    `;
    
    container.appendChild(eventDiv);
  });
}

// Calendar integration functions
function addToGoogleCalendar(index) {
  const event = currentEvents[index];
  const startDate = `${event.date.replace(/-/g, '')}${event.time ? 'T' + event.time.replace(':', '') + '00' : ''}`;
  
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${startDate}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
  
  chrome.tabs.create({ url });
}

function addToOutlook(index) {
  const event = currentEvents[index];
  const url = `https://outlook.live.com/calendar/0/action/compose?subject=${encodeURIComponent(event.title)}&startdt=${event.date}${event.time ? 'T' + event.time : ''}&body=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
  
  chrome.tabs.create({ url });
}

function downloadICS(index) {
  const event = currentEvents[index];
  const icsContent = generateICS(event);
  
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  
  chrome.downloads.download({
    url: url,
    filename: `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`,
    saveAs: true
  });
}

function addToReminders(index) {
  const event = currentEvents[index];
  
  chrome.runtime.sendMessage({
    action: 'addToReminders',
    event: event
  }, (response) => {
    if (response && response.success) {
      alert('Event added to Reminders!');
    } else {
      alert('Failed to add to Reminders. Make sure native messaging is configured.');
    }
  });
}

// Generate ICS file content
function generateICS(event) {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const startDate = event.date.replace(/-/g, '') + (event.time ? 'T' + event.time.replace(':', '') + '00' : '');
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CalClik//Event//EN
BEGIN:VEVENT
UID:${now}@calclik.app
DTSTAMP:${now}
DTSTART:${startDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT
END:VCALENDAR`;
}

// Show error message
function showError(message) {
  const container = document.getElementById('events');
  container.innerHTML = `<div class="error-message">${message}</div>`;
}

// Format license key as user types
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('licenseKeyInput');
  if (input) {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      let formatted = '';
      
      for (let i = 0; i < value.length && i < 20; i++) {
        if (i > 0 && i % 4 === 0) {
          formatted += '-';
        }
        formatted += value[i];
      }
      
      e.target.value = formatted;
    });
  }
});

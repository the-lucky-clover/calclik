// CALCLiK - 3D Skeumorphic Landing Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  // Download Now Button Click Handler
  const downloadBtn = document.querySelector('.download-now-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Show download options modal or direct download
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
        // Chrome users - download Chrome extension
        const link = document.createElement('a');
        link.href = './calclik-chrome-extension.zip';
        link.download = 'calclik-chrome-extension.zip';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Track download
        if (typeof gtag !== 'undefined') {
          gtag('event', 'download', {
            'method': 'navbar_chrome',
            'content_type': 'extension'
          });
        }
        
        // Send to analytics
        sendAnalytics('download_chrome_navbar');
        
      } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
        // Safari users - show Safari info
        alert('Safari extension coming soon! Follow us for updates.');
        
        // Track Safari interest
        sendAnalytics('safari_interest_navbar');
        
      } else {
        // Other browsers - show Chrome download
        const link = document.createElement('a');
        link.href = './calclik-chrome-extension.zip';
        link.download = 'calclik-chrome-extension.zip';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        sendAnalytics('download_chrome_other_navbar');
      }
    });
  }
  
  // Animate on Scroll Observer - only animate once
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('has-animated')) {
        entry.target.classList.add('visible', 'has-animated');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all animate-on-scroll elements
  document.querySelectorAll('.animate-on-scroll').forEach(element => {
    observer.observe(element);
  });

  // Counter Animation for Statistics
  function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const increment = target / 200; // Smooth animation over 200 frames
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
          // Format final number based on the target
          if (target >= 1000000) {
            counter.textContent = (target / 1000000).toFixed(1) + 'M';
          } else if (target >= 1000) {
            counter.textContent = (target / 1000).toFixed(0) + 'K';
          } else if (target < 1) {
            counter.textContent = target.toFixed(2);
          } else {
            counter.textContent = Math.floor(target).toLocaleString();
          }
          clearInterval(timer);
        } else {
          // Format current number during animation
          if (target >= 1000000) {
            counter.textContent = (current / 1000000).toFixed(1) + 'M';
          } else if (target >= 1000) {
            counter.textContent = Math.floor(current / 1000) + 'K';
          } else if (target < 1) {
            counter.textContent = current.toFixed(2);
          } else {
            counter.textContent = Math.floor(current).toLocaleString();
          }
        }
      }, 20);
    });
  }

  // Trigger counter animation when stats section is visible
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.statistics');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Floating Action Button functionality
  const fabButton = document.getElementById('fabButton');
  if (fabButton) {
    fabButton.addEventListener('click', () => {
      // Scroll to hero section or trigger scan action
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    });
  }

  // Parallax effect for hero section
  function handleParallax() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero && scrolled < window.innerHeight) {
      const rate = scrolled * -0.5;
      hero.style.transform = `translateY(${rate}px)`;
    }
  }

  // Throttled scroll handler for performance
  let ticking = false;
  function handleScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleParallax();
        updateNavbarOpacity();
        ticking = false;
      });
      ticking = true;
    }
  }

  // Update navbar opacity based on scroll
  function updateNavbarOpacity() {
    const navbar = document.querySelector('.navbar-capsule');
    const scrolled = window.pageYOffset;
    
    if (navbar) {
      const opacity = Math.min(0.95, scrolled / 200);
      navbar.style.background = `rgba(30, 30, 46, ${0.4 + opacity * 0.4})`;
    }
  }

  // Add scroll event listener
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Add 3D tilt effect to cards
  function addTiltEffect() {
    const cards = document.querySelectorAll('.feature-card-3d, .testimonial-card-3d, .stat-card-3d, .event-card-3d');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / centerY * -10;
        const rotateY = (x - centerX) / centerX * 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      });
    });
  }

  // Initialize tilt effect after DOM is loaded
  setTimeout(addTiltEffect, 500);

  // Magnetic button effect for primary buttons
  function addMagneticEffect() {
    const buttons = document.querySelectorAll('.btn-primary-3d, .btn-primary-3d-large, .fab-button');
    
    buttons.forEach(button => {
      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const moveX = x * 0.1;
        const moveY = y * 0.1;
        
        button.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  // Initialize magnetic effect
  setTimeout(addMagneticEffect, 500);

  // Glitch effect for gradient text (subtle)
  function addGlitchEffect() {
    const gradientTexts = document.querySelectorAll('.gradient-text');
    
    gradientTexts.forEach(text => {
      setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance every interval
          text.style.animation = 'none';
          text.offsetHeight; // Trigger reflow
          text.style.animation = 'textGlitch 0.3s ease-out';
        }
      }, 3000);
    });
  }

  // Add glitch keyframes
  const glitchStyle = document.createElement('style');
  glitchStyle.textContent = `
    @keyframes textGlitch {
      0% { transform: translate(0); }
      20% { transform: translate(-1px, 1px); }
      40% { transform: translate(-1px, -1px); }
      60% { transform: translate(1px, 1px); }
      80% { transform: translate(1px, -1px); }
      100% { transform: translate(0); }
    }
  `;
  document.head.appendChild(glitchStyle);

  // Initialize subtle glitch effect
  setTimeout(addGlitchEffect, 2000);

  // Preload and optimize images
  function preloadImages() {
    const images = ['icons/icon16.png', 'icons/icon48.png', 'icons/icon128.png'];
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }

  preloadImages();

  // Installation Tabs Functionality
  function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Set first tab as active by default
    if (tabButtons.length > 0 && tabPanes.length > 0) {
      tabButtons[0].classList.add('active');
      tabPanes[0].classList.add('active');
    }
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Remove active class from all buttons and panes
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Add active class to clicked button and corresponding pane
        button.classList.add('active');
        const targetPane = document.getElementById(`${targetTab}-download`);
        if (targetPane) {
          targetPane.classList.add('active');
        }
      });
    });
  }

  // Initialize tabs after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTabs);
  } else {
    initializeTabs();
  }

  // Download button handlers - just track analytics, let HTML download attribute work
  function initializeDownloadButtons() {
    // Chrome download buttons
    document.querySelectorAll('.chrome-download-trigger').forEach(btn => {
      btn.addEventListener('click', function() {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'download', { 'method': 'chrome_extension' });
        }
      });
    });

    // Brave download buttons
    document.querySelectorAll('.brave-download-trigger').forEach(btn => {
      btn.addEventListener('click', function() {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'download', { 'method': 'brave_extension' });
        }
      });
    });

    // Safari download buttons
    document.querySelectorAll('.safari-download-trigger').forEach(btn => {
      btn.addEventListener('click', function() {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'download', { 'method': 'safari_extension' });
        }
      });
    });
  }

  // Initialize download buttons when DOM is fully ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDownloadButtons);
  } else {
    initializeDownloadButtons();
  }

  // Update navigation links to include installation
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === '#installation') {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = document.querySelector('#installation');
        
        if (targetSection) {
          targetSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    }
  });

  // Performance optimization: Intersection Observer for expensive animations
  const expensiveAnimationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const element = entry.target;
      
      if (entry.isIntersecting) {
        element.classList.add('animate-expensive');
      } else {
        element.classList.remove('animate-expensive');
      }
    });
  }, { threshold: 0.1 });

  // Observe elements that should only animate when visible
  document.querySelectorAll('.browser-window-3d, .bento-grid').forEach(element => {
    expensiveAnimationObserver.observe(element);
  });

  // Initialize analytics system
  initializeAnalytics();
  
  // Initialize download button functionality
  initializeDownloadButtons();

  console.log('🚀 CALCLiK landing page loaded successfully!');
});

// Anonymous Telemetry & Analytics System
class CALCLiKAnalytics {
  constructor() {
    this.endpoint = 'https://api.CALCLiK.com/telemetry'; // Will be implemented
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.events = [];
    this.isEnabled = true;
    
    // Check if user has opted out of analytics
    if (localStorage.getItem('CALCLiK-analytics-disabled') === 'true') {
      this.isEnabled = false;
    }
    
    this.initializeTracking();
  }
  
  generateSessionId() {
    return 'sess_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
  }
  
  initializeTracking() {
    if (!this.isEnabled) return;
    
    // Track page load
    this.track('page_load', {
      url: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    // Track scroll depth
    this.trackScrollDepth();
    
    // Track time on page
    this.trackTimeOnPage();
    
    // Track clicks on download buttons
    this.trackDownloadClicks();
    
    // Track section visibility
    this.trackSectionViews();
  }
  
  track(event, data = {}) {
    if (!this.isEnabled) return;
    
    const eventData = {
      event,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      data: {
        ...data,
        // Always include basic context
        page: window.location.pathname,
        timestamp: new Date().toISOString()
      }
    };
    
    this.events.push(eventData);
    
    // Send event immediately for critical events
    if (['download_click', 'extension_install'].includes(event)) {
      this.sendEvents([eventData]);
    }
    
    // Batch send other events
    if (this.events.length >= 10) {
      this.sendEvents([...this.events]);
      this.events = [];
    }
  }
  
  trackScrollDepth() {
    let maxScroll = 0;
    const milestones = [25, 50, 75, 90, 100];
    const tracked = new Set();
    
    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        milestones.forEach(milestone => {
          if (scrollPercent >= milestone && !tracked.has(milestone)) {
            tracked.add(milestone);
            this.track('scroll_depth', { depth: milestone });
          }
        });
      }
    };
    
    window.addEventListener('scroll', trackScroll, { passive: true });
  }
  
  trackTimeOnPage() {
    // Track time spent on page in intervals
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        const timeSpent = Date.now() - this.startTime;
        this.track('time_on_page', { duration: timeSpent });
      }
    }, 30000); // Every 30 seconds
    
    // Track when user leaves
    window.addEventListener('beforeunload', () => {
      const totalTime = Date.now() - this.startTime;
      this.track('page_exit', { 
        duration: totalTime,
        exitType: 'beforeunload'
      });
      this.sendEvents([...this.events], true); // Force send
    });
  }
  
  trackDownloadClicks() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (!target) return;
      
      // Track download button clicks
      if (target.href && target.href.includes('.zip')) {
        this.track('download_click', {
          filename: target.href.split('/').pop(),
          buttonText: target.textContent.trim(),
          buttonLocation: this.getElementLocation(target)
        });
      }
      
      // Track CTA button clicks
      if (target.classList.contains('btn-primary-3d') || 
          target.classList.contains('btn-primary-3d-large')) {
        this.track('cta_click', {
          buttonText: target.textContent.trim(),
          buttonLocation: this.getElementLocation(target)
        });
      }
    });
  }
  
  trackSectionViews() {
    const sections = document.querySelectorAll('section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.track('section_view', {
            sectionId: entry.target.id,
            sectionTitle: entry.target.querySelector('h2, h1')?.textContent || entry.target.id
          });
        }
      });
    }, { threshold: 0.5 });
    
    sections.forEach(section => sectionObserver.observe(section));
  }
  
  getElementLocation(element) {
    const rect = element.getBoundingClientRect();
    const section = element.closest('section');
    return {
      x: rect.left,
      y: rect.top,
      section: section?.id || 'unknown'
    };
  }
  
  async sendEvents(events, force = false) {
    if (!this.isEnabled && !force) return;
    
    try {
      // For now, store in localStorage (in production, send to server)
      const stored = JSON.parse(localStorage.getItem('CALCLiK-analytics-events') || '[]');
      stored.push(...events);
      localStorage.setItem('CALCLiK-analytics-events', JSON.stringify(stored.slice(-1000))); // Keep last 1000 events
      
      // In production, uncomment this to send to server:
      /*
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          version: '2.0',
          source: 'landing-page'
        })
      });
      */
      
    } catch (error) {
      console.log('Analytics error (non-critical):', error);
    }
  }
  
  // Public method to disable analytics
  disable() {
    this.isEnabled = false;
    localStorage.setItem('CALCLiK-analytics-disabled', 'true');
    localStorage.removeItem('CALCLiK-analytics-events');
  }
  
  // Public method to get analytics status
  isAnalyticsEnabled() {
    return this.isEnabled;
  }
}

// Live Statistics Display System
class LiveStatistics {
  constructor() {
    this.stats = {
      totalDownloads: 0,
      eventsScanned: 0,
      calendarAdds: 0,
      activeUsers: 0,
      avgScanTime: 0,
      accuracyRate: 0
    };
    
    this.updateInterval = 5000; // Update every 5 seconds
    this.initialize();
  }
  
  async initialize() {
    // Load initial stats
    await this.loadStatistics();
    
    // Start live updates
    setInterval(() => this.updateStatistics(), this.updateInterval);
    
    // Animate counters when analytics section is visible
    this.observeAnalyticsSection();
  }
  
  async loadStatistics() {
    try {
      // Simulate real statistics (in production, fetch from API)
      const baseStats = {
        totalDownloads: 12847,
        eventsScanned: 89234,
        calendarAdds: 45678,
        activeUsers: 3421,
        avgScanTime: 247,
        accuracyRate: 94.7
      };
      
      // Add some realistic variation
      this.stats = {
        totalDownloads: baseStats.totalDownloads + Math.floor(Math.random() * 50),
        eventsScanned: baseStats.eventsScanned + Math.floor(Math.random() * 200),
        calendarAdds: baseStats.calendarAdds + Math.floor(Math.random() * 100),
        activeUsers: baseStats.activeUsers + Math.floor(Math.random() * 20),
        avgScanTime: baseStats.avgScanTime + Math.floor(Math.random() * 100 - 50),
        accuracyRate: baseStats.accuracyRate + (Math.random() * 2 - 1) // ±1%
      };
      
      this.displayStatistics();
    } catch (error) {
      console.log('Error loading statistics:', error);
    }
  }
  
  updateStatistics() {
    // Simulate live updates with small increments
    this.stats.totalDownloads += Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0;
    this.stats.eventsScanned += Math.floor(Math.random() * 15);
    this.stats.calendarAdds += Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0;
    this.stats.activeUsers += Math.floor(Math.random() * 3 - 1); // Can go up or down
    this.stats.avgScanTime += Math.floor(Math.random() * 20 - 10); // Fluctuation
    this.stats.accuracyRate += (Math.random() * 0.2 - 0.1); // Small accuracy changes
    
    // Keep values in reasonable ranges
    this.stats.activeUsers = Math.max(0, this.stats.activeUsers);
    this.stats.avgScanTime = Math.max(100, Math.min(500, this.stats.avgScanTime));
    this.stats.accuracyRate = Math.max(90, Math.min(99, this.stats.accuracyRate));
    
    this.displayStatistics();
  }
  
  displayStatistics() {
    const elements = {
      totalDownloads: document.getElementById('totalDownloads'),
      eventsScanned: document.getElementById('eventsScanned'),
      calendarAdds: document.getElementById('calendarAdds'),
      activeUsers: document.getElementById('activeUsers'),
      avgScanTime: document.getElementById('avgScanTime'),
      accuracyRate: document.getElementById('accuracyRate')
    };
    
    Object.entries(elements).forEach(([key, element]) => {
      if (element) {
        let value = this.stats[key];
        let displayValue;
        
        // Format numbers appropriately
        switch(key) {
          case 'totalDownloads':
          case 'eventsScanned':
          case 'calendarAdds':
          case 'activeUsers':
            displayValue = this.formatNumber(value);
            break;
          case 'avgScanTime':
            displayValue = Math.round(value) + 'ms';
            break;
          case 'accuracyRate':
            displayValue = value.toFixed(1) + '%';
            break;
          default:
            displayValue = value.toString();
        }
        
        if (element.textContent !== displayValue) {
          element.classList.add('updating');
          element.textContent = displayValue;
          setTimeout(() => element.classList.remove('updating'), 600);
        }
      }
    });
  }
  
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    } else {
      return num.toLocaleString();
    }
  }
  
  observeAnalyticsSection() {
    const analyticsSection = document.getElementById('analytics');
    if (!analyticsSection) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Trigger counter animations when section becomes visible
          this.animateCounters();
        }
      });
    }, { threshold: 0.3 });
    
    observer.observe(analyticsSection);
  }
  
  animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach((counter, index) => {
      setTimeout(() => {
        counter.style.animation = 'none';
        counter.offsetHeight; // Trigger reflow
        counter.style.animation = 'countUp 0.8s ease-out';
      }, index * 100);
    });
  }
}

// Initialize analytics and statistics
function initializeAnalytics() {
  // Initialize anonymous telemetry
  window.CALCLiKAnalytics = new CALCLiKAnalytics();
  
  // Initialize live statistics display
  window.liveStatistics = new LiveStatistics();
  
  // Add privacy controls
  addPrivacyControls();
}

function addPrivacyControls() {
  // Add opt-out link to privacy notice
  const privacyNotice = document.querySelector('.privacy-notice .privacy-text p');
  if (privacyNotice) {
    const currentText = privacyNotice.textContent;
    privacyNotice.innerHTML = currentText + ' <a href="#" id="analytics-opt-out" style="color: var(--green-primary); text-decoration: underline;">Opt out of analytics</a>';
    
    document.getElementById('analytics-opt-out').addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Disable anonymous analytics? This will only affect your browser.')) {
        window.CALCLiKAnalytics.disable();
        e.target.textContent = 'Analytics disabled';
        e.target.style.textDecoration = 'none';
      }
    });
  }
}

// Download Button Functionality
function initializeDownloadButtons() {
  // Get all download buttons
  const downloadButtons = document.querySelectorAll('a[download], .download-btn-3d, #hero-chrome-download, #hero-brave-download');
  
  downloadButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      // Ensure the href is set correctly
      if (!this.href || !this.href.includes('.zip')) {
        this.href = 'CALCLiK-chrome-extension.zip';
        this.setAttribute('download', 'CALCLiK-chrome-extension.zip');
      }
      
      // Track download attempt
      if (window.CALCLiKAnalytics) {
        window.CALCLiKAnalytics.track('download_click', {
          buttonId: this.id || 'unknown',
          buttonText: this.textContent.trim(),
          buttonLocation: this.closest('section')?.id || 'unknown',
          timestamp: Date.now()
        });
      }
      
      // Visual feedback
      this.classList.add('downloading');
      
      // Show download feedback
      showDownloadFeedback();
      
      // Remove downloading state after animation
      setTimeout(() => {
        this.classList.remove('downloading');
      }, 2000);
    });
  });
  
  // Check if file exists and provide fallback
  checkDownloadFile();
}

function showDownloadFeedback() {
  // Create or update download notification
  let notification = document.getElementById('download-notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'download-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, var(--green-primary), var(--green-secondary));
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 255, 136, 0.3);
      z-index: 10000;
      font-weight: 600;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;
    document.body.appendChild(notification);
  }
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="currentColor">
        <path d="21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      CALCLiK Extension Downloaded!
    </div>
    <small style="opacity: 0.9; font-weight: 400;">Check your downloads folder</small>
  `;
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Animate out after 4 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

function checkDownloadFile() {
  // Test if the download file is accessible
  fetch('CALCLiK-chrome-extension.zip', { method: 'HEAD' })
    .then(response => {
      if (!response.ok) {
        console.warn('Download file not found, using fallback');
        // Provide fallback download method
        fallbackDownload();
      } else {
        console.log('✅ Download file verified and accessible');
      }
    })
    .catch(error => {
      console.warn('Could not verify download file:', error);
      // Provide fallback download method  
      fallbackDownload();
    });
}

function fallbackDownload() {
  // If ZIP file is not accessible, show alternative download method
  const downloadButtons = document.querySelectorAll('a[download]');
  
  downloadButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Create fallback download notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-card);
        border: var(--border-glass);
        border-radius: 16px;
        padding: 2rem;
        max-width: 500px;
        z-index: 10001;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        text-align: center;
      `;
      
      notification.innerHTML = `
        <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Download CALCLiK Extension</h3>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
          The extension package is temporarily unavailable. You can:
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <a href="https://github.com/the-lucky-clover/CALCLiK/releases" 
             target="_blank" 
             style="background: var(--gradient-primary); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Download from GitHub
          </a>
          <button onclick="this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode)" 
                  style="background: transparent; border: 1px solid var(--border-glass); color: var(--text-secondary); padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">
            Close
          </button>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Remove after 10 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 10000);
    });
  });
}

// URL Scanner Functionality
let aiPipeline = null;

// Initialize AI model for event extraction
async function initializeAI() {
  try {
    // Import Transformers.js
    const { pipeline: createPipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');
    
    // Initialize NER pipeline for event extraction
    aiPipeline = await createPipeline('token-classification', 'Xenova/bert-base-NER');
    
    console.log('AI models loaded successfully for URL scanner');
    return true;
  } catch (error) {
    console.error('Failed to load AI models:', error);
    return false;
  }
}

// Fetch webpage content via proxy to avoid CORS
async function fetchWebpageContent(url) {
  try {
    // Use allorigins.win as a CORS proxy
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.contents) {
      // Parse HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      
      return {
        title: doc.title || 'Unknown Title',
        text: doc.body ? doc.body.innerText : '',
        url: url
      };
    } else {
      throw new Error('No content received from proxy');
    }
  } catch (error) {
    console.error('Error fetching webpage:', error);
    throw error;
  }
}

// Extract events from text content using AI
async function extractEventsWithAI(text) {
  if (!aiPipeline) {
    const initialized = await initializeAI();
    if (!initialized) {
      return extractEventsFallback(text);
    }
  }

  try {
    // Split text into sentences for processing
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const potentialEvents = [];
    
    // Look for sentences containing date/time patterns
    const dateRegex = /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/i;
    const timeRegex = /\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b/i;
    
    for (const sentence of sentences.slice(0, 50)) { // Limit to first 50 sentences
      if (dateRegex.test(sentence) || timeRegex.test(sentence)) {
        potentialEvents.push(sentence.trim());
      }
    }
    
    const events = [];
    
    for (const eventText of potentialEvents.slice(0, 10)) { // Limit to 10 events
      try {
        // Use NER to extract entities
        const entities = await aiPipeline(eventText);
        const event = processEntitiesIntoEvent(eventText, entities);
        
        if (event && event.title) {
          events.push(event);
        }
      } catch (error) {
        console.error('Error processing event text with AI:', error);
        // Fallback to regex extraction
        const fallbackEvent = extractSingleEventFallback(eventText);
        if (fallbackEvent && fallbackEvent.title) {
          events.push(fallbackEvent);
        }
      }
    }
    
    return events;
    
  } catch (error) {
    console.error('AI processing failed, using fallback:', error);
    return extractEventsFallback(text);
  }
}

// Process NER entities into structured event data
function processEntitiesIntoEvent(text, entities) {
  const event = {
    title: '',
    date: '',
    time: '',
    location: '',
    description: text.substring(0, 200) + (text.length > 200 ? '...' : '')
  };
  
  // Extract locations from NER entities
  const locations = entities.filter(e => e.entity.includes('LOC')).map(e => e.word);
  if (locations.length > 0) {
    event.location = locations.join(' ').replace(/##/g, '').trim().substring(0, 50);
  }
  
  // Extract organizations as potential event names
  const organizations = entities.filter(e => e.entity.includes('ORG')).map(e => e.word);
  if (organizations.length > 0) {
    event.title = organizations.join(' ').replace(/##/g, '').trim();
  }
  
  // Use regex for dates and times (more reliable than NER for these)
  const dateMatch = text.match(/\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/i);
  if (dateMatch) {
    event.date = formatDate(dateMatch[0]);
  }
  
  const timeMatch = text.match(/\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b/i);
  if (timeMatch) {
    event.time = formatTime(timeMatch[0]);
  }
  
  // Generate title if not found from entities
  if (!event.title) {
    const words = text.split(' ').slice(0, 6);
    event.title = words.join(' ').replace(/[^\w\s]/g, '').trim();
  }
  
  // Add location from common patterns if not found by NER
  if (!event.location) {
    const locationMatch = text.match(/(?:at|in|@)\s+([A-Z][a-zA-Z\s,]+(?:[A-Z][a-zA-Z\s,]*)*)/i);
    if (locationMatch) {
      event.location = locationMatch[1].trim().substring(0, 50);
    }
  }
  
  return event.title ? event : null;
}

// Fallback extraction using regex patterns when AI fails
function extractEventsFallback(text) {
  const events = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Date and time patterns
  const dateRegex = /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/i;
  const timeRegex = /\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b/i;
  
  for (const sentence of sentences.slice(0, 20)) {
    if (dateRegex.test(sentence) || timeRegex.test(sentence)) {
      const event = extractSingleEventFallback(sentence);
      if (event && event.title) {
        events.push(event);
      }
    }
  }
  
  return events.slice(0, 5); // Limit to 5 events for fallback
}

// Extract single event using regex fallback
function extractSingleEventFallback(text) {
  const event = {
    title: '',
    date: '',
    time: '',
    location: '',
    description: text.substring(0, 200) + (text.length > 200 ? '...' : '')
  };
  
  // Extract date
  const dateMatch = text.match(/\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/i);
  if (dateMatch) {
    event.date = formatDate(dateMatch[0]);
  }
  
  // Extract time
  const timeMatch = text.match(/\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b/i);
  if (timeMatch) {
    event.time = formatTime(timeMatch[0]);
  }
  
  // Extract location (words after "at", "in", "@")
  const locationMatch = text.match(/(?:at|in|@)\s+([A-Z][a-zA-Z\s,]+(?:[A-Z][a-zA-Z\s,]*)*)/i);
  if (locationMatch) {
    event.location = locationMatch[1].trim().substring(0, 50);
  }
  
  // Generate title from first few words
  const words = text.split(' ').slice(0, 6);
  event.title = words.join(' ').replace(/[^\w\s]/g, '').trim();
  
  return event.title ? event : null;
}

// Date formatting helper
function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr; // Return original if can't parse
    }
    return date.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
}

// Time formatting helper
function formatTime(timeStr) {
  try {
    const time = timeStr.replace(/\s*(AM|PM|am|pm)/i, ' $1');
    const date = new Date(`1970-01-01 ${time}`);
    if (isNaN(date.getTime())) {
      return timeStr; // Return original if can't parse
    }
    return date.toTimeString().substring(0, 5);
  } catch {
    return timeStr;
  }
}

// Display events in the UI
function displayEvents(events) {
  const eventsContainer = document.getElementById('extractedEvents');
  const eventsCount = document.getElementById('eventsCount');
  const eventsList = document.getElementById('eventsList');
  
  if (events.length === 0) {
    eventsContainer.style.display = 'none';
    return;
  }
  
  eventsCount.textContent = events.length;
  eventsContainer.style.display = 'block';
  
  // Clear previous events
  eventsList.innerHTML = '';
  
  events.forEach((event, index) => {
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card-result glass-shimmer';
    
    eventCard.innerHTML = `
      <div class="event-card-header">
        <div class="event-icon">
          <i data-lucide="calendar" class="calendar-icon"></i>
        </div>
        <div class="event-main-info">
          <h4 class="event-title">${escapeHtml(event.title)}</h4>
          <div class="event-datetime">
            ${event.date ? `<span class="event-date">${formatDisplayDate(event.date)}</span>` : ''}
            ${event.time ? `<span class="event-time">${event.time}</span>` : ''}
          </div>
          ${event.location ? `<div class="event-location"><i data-lucide="map-pin"></i> ${escapeHtml(event.location)}</div>` : ''}
        </div>
      </div>
      
      <div class="event-description">
        ${escapeHtml(event.description)}
      </div>
      
      <div class="event-actions">
        <button onclick="addToGoogleCalendar(${index})" class="calendar-btn google-btn">
          <span>Google Calendar</span>
        </button>
        <button onclick="addToOutlookCalendar(${index})" class="calendar-btn outlook-btn">
          <span>Outlook</span>
        </button>
        <button onclick="downloadICalFile(${index})" class="calendar-btn apple-btn">
          <span>Download iCal</span>
        </button>
      </div>
    `;
    
    eventsList.appendChild(eventCard);
  });
  
  // Re-initialize Lucide icons for new elements
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  // Store events globally for calendar integration
  window.extractedEvents = events;
}

// Calendar integration functions
function addToGoogleCalendar(eventIndex) {
  const event = window.extractedEvents[eventIndex];
  const startDate = event.date && event.time ? 
    `${event.date}T${event.time}:00` : 
    event.date ? `${event.date}T09:00:00` : '';
  
  const endDate = event.date && event.time ? 
    `${event.date}T${addHour(event.time)}:00` : 
    event.date ? `${event.date}T10:00:00` : '';
  
  const googleUrl = `https://calendar.google.com/calendar/event?action=TEMPLATE` +
    `&text=${encodeURIComponent(event.title)}` +
    `&dates=${startDate.replace(/[-:]/g, '')}/${endDate.replace(/[-:]/g, '')}` +
    `&details=${encodeURIComponent(event.description)}` +
    `&location=${encodeURIComponent(event.location || '')}`;
  
  window.open(googleUrl, '_blank');
}

function addToOutlookCalendar(eventIndex) {
  const event = window.extractedEvents[eventIndex];
  const startDate = event.date && event.time ? 
    `${event.date}T${event.time}:00` : 
    event.date ? `${event.date}T09:00:00` : '';
  
  const endDate = event.date && event.time ? 
    `${event.date}T${addHour(event.time)}:00` : 
    event.date ? `${event.date}T10:00:00` : '';
  
  const outlookUrl = `https://outlook.live.com/calendar/0/action/compose` +
    `?subject=${encodeURIComponent(event.title)}` +
    `&startdt=${startDate}` +
    `&enddt=${endDate}` +
    `&body=${encodeURIComponent(event.description)}` +
    `&location=${encodeURIComponent(event.location || '')}`;
  
  window.open(outlookUrl, '_blank');
}

function downloadICalFile(eventIndex) {
  const event = window.extractedEvents[eventIndex];
  const startDate = event.date && event.time ? 
    `${event.date.replace(/-/g, '')}T${event.time.replace(':', '')}00` : 
    event.date ? `${event.date.replace(/-/g, '')}T090000` : '';
  
  const endDate = event.date && event.time ? 
    `${event.date.replace(/-/g, '')}T${addHour(event.time).replace(':', '')}00` : 
    event.date ? `${event.date.replace(/-/g, '')}T100000` : '';
  
  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CALCLiK//Event Scanner//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@calclik.app`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    event.location ? `LOCATION:${event.location}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line).join('\r\n');
  
  const blob = new Blob([icalContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Helper functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDisplayDate(dateStr) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateStr;
  }
}

function addHour(timeStr) {
  try {
    const [hours, minutes] = timeStr.split(':');
    const newHours = (parseInt(hours) + 1) % 24;
    return `${newHours.toString().padStart(2, '0')}:${minutes}`;
  } catch {
    return timeStr;
  }
}

// Initialize URL Scanner
function initializeUrlScanner() {
  const scanBtn = document.getElementById('scanUrlBtn');
  const urlInput = document.getElementById('websiteUrl');
  const scannerStatus = document.getElementById('scannerStatus');
  
  if (scanBtn && urlInput) {
    scanBtn.addEventListener('click', handleUrlScan);
    
    // Allow Enter key in input field
    urlInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        handleUrlScan();
      }
    });
  }
}

async function handleUrlScan() {
  const urlInput = document.getElementById('websiteUrl');
  const scanBtn = document.getElementById('scanUrlBtn');
  const scannerStatus = document.getElementById('scannerStatus');
  const eventsContainer = document.getElementById('extractedEvents');
  
  const url = urlInput.value.trim();
  
  if (!url) {
    alert('Please enter a valid URL');
    return;
  }
  
  // Validate URL format
  try {
    new URL(url);
  } catch {
    alert('Please enter a valid URL (e.g., https://example.com)');
    return;
  }
  
  // Show loading state
  scanBtn.disabled = true;
  scanBtn.innerHTML = `
    <div class="loading-spinner"></div>
    <span>Scanning...</span>
  `;
  scannerStatus.style.display = 'block';
  eventsContainer.style.display = 'none';
  
  try {
    // Update status
    document.querySelector('.status-text').textContent = 'Fetching webpage content...';
    
    // Fetch webpage content
    const content = await fetchWebpageContent(url);
    
    // Update status
    document.querySelector('.status-text').textContent = 'Analyzing content with AI...';
    
    // Extract events with AI
    const events = await extractEventsWithAI(content.text);
    
    // Hide loading state
    scannerStatus.style.display = 'none';
    
    // Display results
    displayEvents(events);
    
    // Track analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'url_scan', {
        'method': 'landing_page',
        'events_found': events.length
      });
    }
    
  } catch (error) {
    console.error('Error scanning URL:', error);
    
    // Hide loading state
    scannerStatus.style.display = 'none';
    
    // Show error message
    alert('Sorry, we could not scan that webpage. Please try a different URL or check if the website is accessible.');
  } finally {
    // Reset button state
    scanBtn.disabled = false;
    scanBtn.innerHTML = `
      <i data-lucide="sparkles" class="scan-icon"></i>
      <span>Scan Events</span>
      <div class="btn-fill"></div>
    `;
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
}

// Modal Functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    // Use setTimeout to allow display change to take effect before adding show class
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Track modal opens
    if (typeof gtag !== 'undefined') {
      gtag('event', 'modal_open', {
        'modal_name': modalId,
        'event_category': 'legal'
      });
    }
    
    sendAnalytics(`modal_open_${modalId}`);
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    // Wait for transition to complete before hiding
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    // Track modal closes
    sendAnalytics(`modal_close_${modalId}`);
  }
}

// Close modal when clicking outside the modal content
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    const modalId = e.target.id;
    closeModal(modalId);
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const openModals = document.querySelectorAll('.modal-overlay.show');
    openModals.forEach(modal => {
      closeModal(modal.id);
    });
  }
});

// Initialize Hero URL Scanner
function initializeHeroUrlScanner() {
  const heroScanBtn = document.getElementById('heroScanUrlBtn');
  const heroUrlInput = document.getElementById('heroWebsiteUrl');
  const heroScannerStatus = document.getElementById('heroScannerStatus');
  
  if (heroScanBtn && heroUrlInput) {
    heroScanBtn.addEventListener('click', handleHeroUrlScan);
    
    // Allow Enter key in input field
    heroUrlInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        handleHeroUrlScan();
      }
    });
  }
}

async function handleHeroUrlScan() {
  const heroUrlInput = document.getElementById('heroWebsiteUrl');
  const heroScanBtn = document.getElementById('heroScanUrlBtn');
  const heroScannerStatus = document.getElementById('heroScannerStatus');
  const heroEventsContainer = document.getElementById('heroExtractedEvents');
  
  const url = heroUrlInput.value.trim();
  
  if (!url) {
    alert('Please enter a valid URL');
    return;
  }
  
  // Validate URL format
  try {
    new URL(url);
  } catch {
    alert('Please enter a valid URL (e.g., https://example.com)');
    return;
  }
  
  // Show loading state
  heroScanBtn.disabled = true;
  heroScanBtn.innerHTML = `
    <div class="loading-spinner"></div>
    <span>Scanning...</span>
  `;
  heroScannerStatus.style.display = 'block';
  heroEventsContainer.style.display = 'none';
  
  try {
    // Update status
    heroScannerStatus.querySelector('.status-text').textContent = 'Fetching webpage content...';
    
    // Fetch webpage content
    const content = await fetchWebpageContent(url);
    
    // Update status
    heroScannerStatus.querySelector('.status-text').textContent = 'Analyzing content with AI...';
    
    // Extract events with AI
    const events = await extractEventsWithAI(content.text);
    
    // Hide loading state
    heroScannerStatus.style.display = 'none';
    
    // Display results in hero section
    displayHeroEvents(events);
    
    // Track analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'hero_url_scan', {
        'method': 'hero_section',
        'events_found': events.length
      });
    }
    
    sendAnalytics(`hero_url_scan_success_${events.length}_events`);
    
  } catch (error) {
    console.error('Error scanning URL:', error);
    
    // Hide loading state
    heroScannerStatus.style.display = 'none';
    
    // Show error message
    alert('Sorry, there was an error scanning this URL. Please try again or check if the URL is accessible.');
    
    // Track error
    sendAnalytics('hero_url_scan_error');
  } finally {
    // Reset button
    heroScanBtn.disabled = false;
    heroScanBtn.innerHTML = `
      <i data-lucide="sparkles" class="scan-icon"></i>
      <span>Scan Events</span>
    `;
    
    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
}

// Display events in hero section
function displayHeroEvents(events) {
  const heroEventsContainer = document.getElementById('heroExtractedEvents');
  const heroEventsList = document.getElementById('heroEventsList');
  const heroEventsCount = document.getElementById('heroEventsCount');
  
  if (events.length === 0) {
    heroEventsContainer.style.display = 'block';
    heroEventsList.innerHTML = `
      <div class="no-events">
        <i data-lucide="calendar-x" class="no-events-icon"></i>
        <p>No events found on this webpage. Try a different URL with event listings.</p>
      </div>
    `;
    heroEventsCount.textContent = '0';
  } else {
    heroEventsContainer.style.display = 'block';
    heroEventsCount.textContent = events.length;
    
    heroEventsList.innerHTML = events.map((event, index) => `
      <div class="event-card hero-event-card" data-event-index="${index}">
        <div class="event-main">
          <div class="event-header">
            <h4 class="event-title">${escapeHtml(event.title || 'Untitled Event')}</h4>
            <div class="event-badges">
              ${event.date ? `<span class="event-badge date"><i data-lucide="calendar"></i>${event.date}</span>` : ''}
              ${event.time ? `<span class="event-badge time"><i data-lucide="clock"></i>${event.time}</span>` : ''}
            </div>
          </div>
          
          ${event.location ? `<div class="event-location"><i data-lucide="map-pin"></i>${escapeHtml(event.location)}</div>` : ''}
          ${event.description ? `<div class="event-description">${escapeHtml(event.description).substring(0, 150)}${event.description.length > 150 ? '...' : ''}</div>` : ''}
        </div>
        
        <div class="event-actions hero-event-actions">
          <button class="add-to-calendar-btn google" onclick="addToGoogleCalendar(${index})" title="Add to Google Calendar">
            <i data-lucide="calendar-plus"></i>
            Google
          </button>
          <button class="add-to-calendar-btn outlook" onclick="addToOutlookCalendar(${index})" title="Add to Outlook">
            <i data-lucide="calendar-plus"></i>
            Outlook
          </button>
          <button class="add-to-calendar-btn apple" onclick="downloadICalFile(${index})" title="Download .ics file">
            <i data-lucide="download"></i>
            Download
          </button>
        </div>
      </div>
    `).join('');
  }
  
  // Re-initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Shimmer Animation Controller
function initializeShimmerAnimations() {
  let idleTimer;
  let isIdle = false;
  const idleDelay = 5000; // 5 seconds of inactivity
  
  // Reset idle timer
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    isIdle = false;
    idleTimer = setTimeout(() => {
      isIdle = true;
      triggerRandomShimmer();
    }, idleDelay);
  }
  
  // Trigger random shimmer effect on idle
  function triggerRandomShimmer() {
    if (isIdle) {
      const shimmerElements = document.querySelectorAll('.glass-shimmer');
      if (shimmerElements.length > 0) {
        const randomElement = shimmerElements[Math.floor(Math.random() * shimmerElements.length)];
        randomElement.classList.add('shimmer-active');
        
        setTimeout(() => {
          randomElement.classList.remove('shimmer-active');
        }, 1500);
      }
      
      // Schedule next idle shimmer
      setTimeout(() => {
        if (isIdle) triggerRandomShimmer();
      }, 3000 + Math.random() * 4000); // 3-7 seconds
    }
  }
  
  // Add click listeners to shimmer elements
  document.querySelectorAll('.glass-shimmer').forEach(element => {
    element.addEventListener('click', function() {
      this.classList.add('shimmer-active');
      setTimeout(() => {
        this.classList.remove('shimmer-active');
      }, 1500);
      resetIdleTimer();
    });
  });
  
  // Track mouse movement for idle detection
  document.addEventListener('mousemove', resetIdleTimer);
  document.addEventListener('keypress', resetIdleTimer);
  document.addEventListener('scroll', resetIdleTimer);
  
  // Start idle timer
  resetIdleTimer();
}

// Interactive Logo Enhancement for Addictive UX
function initializeInteractiveLogo() {
  const heroLogo = document.querySelector('.hero-logo');
  const logoText = document.querySelector('.hero-logo-text');
  const logoIcon = document.querySelector('.hero-logo-icon');
  let clickCount = 0;
  let lastClickTime = 0;
  
  if (heroLogo && logoText && logoIcon) {
    // Logo click interaction with satisfying feedback
    heroLogo.addEventListener('click', function(e) {
      e.preventDefault();
      clickCount++;
      const now = Date.now();
      
      // Create ripple effect
      createLogoRipple(e);
      
      // Multi-click rewards system for psychological engagement
      if (now - lastClickTime < 1000 && clickCount > 1) {
        // Rapid clicks = enhanced animation
        logoText.style.animation = 'none';
        logoIcon.style.animation = 'none';
        
        setTimeout(() => {
          logoText.style.animation = 'subtleWobble 1s ease-in-out, logoGlow 0.5s ease-out';
          logoIcon.style.animation = 'sparkleGlow 1s ease-in-out, iconSpin 0.8s ease-out';
        }, 10);
        
        // Satisfying haptic-like visual feedback
        heroLogo.style.transform = 'scale(0.95)';
        setTimeout(() => {
          heroLogo.style.transform = 'scale(1.05)';
          setTimeout(() => {
            heroLogo.style.transform = 'scale(1)';
          }, 100);
        }, 50);
        
        // Track engagement
        if (typeof gtag !== 'undefined') {
          gtag('event', 'logo_multi_click', {
            'click_count': clickCount,
            'event_category': 'engagement'
          });
        }
      } else {
        // Single click = subtle satisfaction
        logoText.style.filter = 'drop-shadow(0 0 15px rgba(0, 255, 136, 0.5))';
        logoIcon.style.transform = 'scale(1.1) rotate(15deg)';
        
        setTimeout(() => {
          logoText.style.filter = '';
          logoIcon.style.transform = '';
        }, 300);
      }
      
      lastClickTime = now;
      
      // Reset click count after pause
      setTimeout(() => {
        if (Date.now() - lastClickTime >= 2000) {
          clickCount = 0;
        }
      }, 2000);
    });
    
    // Subtle breathing animation when idle
    let idleTimer;
    function startBreathing() {
      idleTimer = setTimeout(() => {
        if (!document.querySelector('.hero-logo:hover')) {
          logoText.style.animation += ', logoBreathing 4s ease-in-out infinite';
          logoIcon.style.animation += ', iconBreathing 4s ease-in-out infinite';
        }
      }, 8000);
    }
    
    function stopBreathing() {
      clearTimeout(idleTimer);
      logoText.style.animation = logoText.style.animation.replace(', logoBreathing 4s ease-in-out infinite', '');
      logoIcon.style.animation = logoIcon.style.animation.replace(', iconBreathing 4s ease-in-out infinite', '');
    }
    
    // Reset breathing on interaction
    document.addEventListener('mousemove', () => {
      stopBreathing();
      startBreathing();
    });
    
    startBreathing();
  }
}

// Create satisfying ripple effect on logo click
function createLogoRipple(event) {
  const ripple = document.createElement('div');
  const rect = event.currentTarget.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: radial-gradient(circle, rgba(0, 255, 136, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    animation: rippleExpand 0.6s ease-out forwards;
  `;
  
  event.currentTarget.style.position = 'relative';
  event.currentTarget.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Framer Motion-inspired Animation System
function initializeAnimations() {
  // Track which elements have been animated
  const animatedElements = new Set();

  // Create intersection observer for scroll animations
  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting && !animatedElements.has(entry.target)) {
        animatedElements.add(entry.target);
        // Add staggered delay based on element order
        const delay = index * 100;
        setTimeout(() => {
          entry.target.classList.add('animate-in');
        }, delay);
        animationObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });

  // Hero section animations disabled - elements now visible immediately
  // const pageLoadElements = document.querySelectorAll('[data-motion]');
  // pageLoadElements.forEach((element, index) => {
  //   if (!animatedElements.has(element)) {
  //     animatedElements.add(element);
  //     element.classList.add('motion-element');
  //     const delay = index * 120; // Reduced stagger for smoother feel
  //     setTimeout(() => {
  //       element.classList.add('animate-in');
  //     }, delay + 200); // Reduced initial delay
  //   }
  // });

  // Observe elements for scroll-triggered animations
  const scrollElements = document.querySelectorAll('.animate-on-scroll, .feature-card-3d, .bento-grid > *');
  scrollElements.forEach((element) => {
    if (!animatedElements.has(element)) {
      element.classList.add('motion-element');
      animationObserver.observe(element);
    }
  });

  // Special animations for specific elements
  initializeMaterializeAnimations();
  initializeFlyInAnimations();
}

function initializeMaterializeAnimations() {
  // Hero animations disabled - elements now visible immediately
  // const materializeElements = document.querySelectorAll('.hero-logo, .hero-headline, .hero-subtitle');
  // materializeElements.forEach((element, index) => {
  //   element.style.animationDelay = `${index * 200}ms`;
  //   element.classList.add('animate-materialize');
  // });
}

function initializeFlyInAnimations() {
  // Hero animations disabled - elements now visible immediately
  // const flyInElements = document.querySelectorAll('.hero-url-scanner, .hero-mockup');
  // flyInElements.forEach((element, index) => {
  //   element.style.animationDelay = `${600 + (index * 300)}ms`;
  //   element.classList.add('animate-fly-in');
  // });
}

// Enhanced micro-interactions
function initializeEnhancedInteractions() {
  // Hero section hover effects
  const heroLeft = document.querySelector('.hero-left-skewed');
  const heroRight = document.querySelector('.hero-right-skewed');

  if (heroLeft) {
    heroLeft.addEventListener('mouseenter', () => {
      heroLeft.style.transform = 'perspective(1000px) rotateY(2deg) rotateX(-0.5deg) scale(1.02)';
    });
    
    heroLeft.addEventListener('mouseleave', () => {
      heroLeft.style.transform = 'perspective(1000px) rotateY(3deg) rotateX(-1deg)';
    });
  }

  if (heroRight) {
    heroRight.addEventListener('mouseenter', () => {
      heroRight.style.transform = 'perspective(1000px) rotateY(-2deg) rotateX(-0.5deg) scale(1.02)';
    });
    
    heroRight.addEventListener('mouseleave', () => {
      heroRight.style.transform = 'perspective(1000px) rotateY(-3deg) rotateX(-1deg)';
    });
  }

  // Enhanced input interactions
  const urlInput = document.getElementById('heroWebsiteUrl');
  const inputGroup = document.querySelector('.url-input-group');

  if (urlInput && inputGroup) {
    urlInput.addEventListener('focus', () => {
      inputGroup.style.transform = 'translateY(-2px) scale(1.01)';
      inputGroup.style.boxShadow = '0 0 0 4px var(--green-glow), 0 20px 40px rgba(0, 212, 255, 0.2)';
    });

    urlInput.addEventListener('blur', () => {
      inputGroup.style.transform = 'translateY(0) scale(1)';
      inputGroup.style.boxShadow = 'var(--shadow-soft)';
    });
  }

  // Button ripple effects
  const enhancedButtons = document.querySelectorAll('.hero-scan-btn-enhanced');
  enhancedButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('div');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 10;
        animation: rippleExpand 0.6s ease-out forwards;
      `;
      
      this.style.position = 'relative';
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

// Initialize URL scanner when page loads
document.addEventListener('DOMContentLoaded', function() {
  // ... existing initialization code ...
  
  // Initialize URL scanner
  initializeUrlScanner();
  
  // Initialize hero URL scanner
  initializeHeroUrlScanner();
  
  // Initialize shimmer animations
  initializeShimmerAnimations();
  
  // Initialize interactive logo
  initializeInteractiveLogo();
  
  // Initialize advanced animations
  initializeAnimations();
  
  // Initialize enhanced interactions
  initializeEnhancedInteractions();
  
  // Initialize modal functionality
  console.log('Enhanced CALCLiK with advanced animations initialized');
});

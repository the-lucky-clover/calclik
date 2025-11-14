// CALCLiK Safari Extension - Popup JavaScript
// 3D Skeumorphic interface for event scanning and calendar integration

(() => {
  'use strict';
  
  console.log('🖼️ CALCLiK Safari popup loaded');
  
  // DOM Elements
  const elements = {
    pageTitle: document.getElementById('pageTitle'),
    pageUrl: document.getElementById('pageUrl'),
    scanBtn: document.getElementById('scanBtn'),
    scanIcon: document.getElementById('scanIcon'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    scanText: document.getElementById('scanText'),
    eventsHeader: document.getElementById('eventsHeader'),
    eventsCount: document.getElementById('eventsCount'),
    eventsContainer: document.getElementById('eventsContainer'),
    emptyState: document.getElementById('emptyState'),
    errorState: document.getElementById('errorState'),
    errorMessage: document.getElementById('errorMessage'),
    clearBtn: document.getElementById('clearBtn'),
    settingsBtn: document.getElementById('settingsBtn')
  };
  
  // State management
  let state = {
    isScanning: false,
    events: [],
    currentTab: null,
    pageInfo: null
  };
  
  // Initialize popup
  async function initialize() {
    try {
      // Get current tab
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      state.currentTab = tabs[0];
      
      if (!state.currentTab) {
        showError('Could not access current tab');
        return;
      }
      
      // Get page info
      await loadPageInfo();
      
      // Set up event listeners
      setupEventListeners();
      
      console.log('✅ Popup initialized');
      
    } catch (error) {
      console.error('❌ Popup initialization failed:', error);
      showError('Failed to initialize CALCLiK');
    }
  }
  
  // Load page information
  async function loadPageInfo() {
    try {
      // Get page info from content script
      const response = await browser.tabs.sendMessage(state.currentTab.id, {
        action: 'getPageInfo'
      });
      
      if (response && response.success) {
        state.pageInfo = response.pageInfo;
        displayPageInfo(response.pageInfo);
        
        // Show scan button with appropriate text
        if (response.pageInfo.hasEvents) {
          elements.scanText.textContent = 'Rescan Page';
        }
      } else {
        // Fallback to tab info
        displayPageInfo({
          title: state.currentTab.title,
          url: state.currentTab.url,
          domain: new URL(state.currentTab.url).hostname
        });
      }
      
    } catch (error) {
      console.error('❌ Failed to get page info:', error);
      
      // Fallback display
      displayPageInfo({
        title: state.currentTab.title || 'Unknown Page',
        url: state.currentTab.url || '',
        domain: state.currentTab.url ? new URL(state.currentTab.url).hostname : 'Unknown'
      });
    }
  }
  
  // Display page information
  function displayPageInfo(pageInfo) {
    elements.pageTitle.textContent = pageInfo.title || 'Untitled Page';
    elements.pageUrl.textContent = pageInfo.url || pageInfo.domain || 'Unknown URL';
    
    // Add title attribute for full text on hover
    elements.pageTitle.title = pageInfo.title || '';
    elements.pageUrl.title = pageInfo.url || '';
  }
  
  // Set up event listeners
  function setupEventListeners() {
    // Scan button
    elements.scanBtn.addEventListener('click', handleScanClick);
    
    // Clear button
    elements.clearBtn.addEventListener('click', handleClearClick);
    
    // Settings button
    elements.settingsBtn.addEventListener('click', handleSettingsClick);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);
  }
  
  // Handle scan button click
  async function handleScanClick() {
    if (state.isScanning) return;
    
    try {
      await startScan();
    } catch (error) {
      console.error('❌ Scan failed:', error);
      showError(error.message || 'Scan failed. Please try again.');
    }
  }
  
  // Start page scan
  async function startScan() {
    state.isScanning = true;
    
    // Update UI to scanning state
    elements.scanBtn.classList.add('scanning');
    elements.scanIcon.style.display = 'none';
    elements.loadingSpinner.style.display = 'block';
    elements.scanText.textContent = 'Scanning with AI...';
    elements.errorState.style.display = 'none';
    
    try {
      console.log('🔍 Starting page scan...');
      
      // Send scan message to content script
      const response = await browser.tabs.sendMessage(state.currentTab.id, {
        action: 'scanPage'
      });
      
      if (response && response.success) {
        state.events = response.events || [];
        console.log(`✅ Scan complete: ${state.events.length} events found`);
        
        // Display results
        displayEvents(state.events);
        
        // Success feedback
        elements.scanBtn.classList.add('success-pulse');
        setTimeout(() => elements.scanBtn.classList.remove('success-pulse'), 600);
        
        // Track successful scan
        trackEvent('scan_success', {
          eventCount: state.events.length,
          domain: state.pageInfo?.domain
        });
        
      } else {
        throw new Error(response?.error || 'No events found on this page');
      }
      
    } catch (error) {
      console.error('❌ Scan error:', error);
      showError(error.message);
      
      // Track failed scan
      trackEvent('scan_error', {
        error: error.message,
        domain: state.pageInfo?.domain
      });
      
    } finally {
      // Reset UI
      state.isScanning = false;
      elements.scanBtn.classList.remove('scanning');
      elements.scanIcon.style.display = 'block';
      elements.loadingSpinner.style.display = 'none';
      elements.scanText.textContent = state.events.length > 0 ? 'Rescan Page' : 'Scan for Events';
    }
  }
  
  // Display events in the popup
  function displayEvents(events) {
    if (!events || events.length === 0) {
      showEmptyState();
      return;
    }
    
    // Hide empty state and show events
    elements.emptyState.style.display = 'none';
    elements.eventsHeader.style.display = 'flex';
    elements.eventsCount.textContent = `${events.length} event${events.length === 1 ? '' : 's'} found`;
    
    // Clear existing events
    const existingEvents = elements.eventsContainer.querySelectorAll('.event-item');
    existingEvents.forEach(el => el.remove());
    
    // Create event items
    events.forEach((event, index) => {
      const eventElement = createEventElement(event, index);
      elements.eventsContainer.appendChild(eventElement);
    });
    
    // Scroll to top of events
    elements.eventsContainer.scrollTop = 0;
  }
  
  // Create individual event element
  function createEventElement(event, index) {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event-item fade-in';
    eventDiv.style.animationDelay = `${index * 0.1}s`;
    
    eventDiv.innerHTML = `
      <div class="event-title">${escapeHtml(event.title || 'Untitled Event')}</div>
      <div class="event-details">
        ${event.date ? `
          <div class="event-detail">
            <svg class="event-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>${formatDate(event.date)}</span>
          </div>
        ` : ''}
        ${event.time ? `
          <div class="event-detail">
            <svg class="event-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <span>${formatTime(event.time)}</span>
          </div>
        ` : ''}
        ${event.location ? `
          <div class="event-detail">
            <svg class="event-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>${escapeHtml(event.location)}</span>
          </div>
        ` : ''}
      </div>
      <div class="calendar-buttons">
        <a href="${generateCalendarLink('google', event)}" target="_blank" class="calendar-btn" data-calendar="google">
          <svg class="calendar-btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
          </svg>
          Google
        </a>
        <a href="${generateCalendarLink('outlook', event)}" target="_blank" class="calendar-btn" data-calendar="outlook">
          <svg class="calendar-btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 9l4 4 4-4H7z"/>
          </svg>
          Outlook
        </a>
        <button class="calendar-btn" data-calendar="macos" onclick="addToMacOS('${escapeForAttribute(JSON.stringify(event))}')">
          <svg class="calendar-btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
          </svg>
          macOS
        </button>
      </div>
    `;
    
    // Add click handler for event highlighting
    eventDiv.addEventListener('click', () => {
      highlightEventOnPage(event, index);
    });
    
    return eventDiv;
  }
  
  // Generate calendar links
  function generateCalendarLink(type, event) {
    const baseUrls = {
      google: 'https://calendar.google.com/calendar/render?action=TEMPLATE',
      outlook: 'https://outlook.live.com/calendar/0/deeplink/compose'
    };
    
    const params = new URLSearchParams();
    
    if (type === 'google') {
      params.set('text', event.title || 'Event');
      if (event.date) {
        const startDate = event.date + (event.time ? 'T' + event.time : 'T09:00');
        params.set('dates', startDate + '/' + startDate);
      }
      if (event.location) params.set('location', event.location);
      if (event.description) params.set('details', event.description);
      
    } else if (type === 'outlook') {
      params.set('subject', event.title || 'Event');
      if (event.date) params.set('startdt', event.date + (event.time ? 'T' + event.time : 'T09:00'));
      if (event.location) params.set('location', event.location);
      if (event.description) params.set('body', event.description);
    }
    
    return baseUrls[type] + '&' + params.toString();
  }
  
  // Add to macOS Calendar/Reminders
  window.addToMacOS = function(eventJson) {
    try {
      const event = JSON.parse(eventJson);
      
      // Create iCal file content
      const icalContent = generateICalContent(event);
      
      // Create blob and download
      const blob = new Blob([icalContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title || 'event'}.ics`;
      a.click();
      
      URL.revokeObjectURL(url);
      
      // Track calendar add
      trackEvent('calendar_add', { type: 'macos', title: event.title });
      
    } catch (error) {
      console.error('❌ Failed to add to macOS calendar:', error);
      showError('Failed to create calendar file');
    }
  };
  
  // Generate iCal content
  function generateICalContent(event) {
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const startDate = event.date ? 
      (event.date.replace(/-/g, '') + (event.time ? 'T' + event.time.replace(':', '') + '00' : 'T090000')) :
      now;
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CALCLiK//CALCLiK Safari Extension//EN
BEGIN:VEVENT
UID:${now}-CALCLiK@CALCLiK.com
DTSTAMP:${now}
DTSTART:${startDate}
SUMMARY:${event.title || 'Event'}
${event.description ? `DESCRIPTION:${event.description}` : ''}
${event.location ? `LOCATION:${event.location}` : ''}
END:VEVENT
END:VCALENDAR`;
  }
  
  // Highlight event on page
  async function highlightEventOnPage(event, index) {
    try {
      await browser.tabs.sendMessage(state.currentTab.id, {
        action: 'highlightEvents',
        events: [event]
      });
      
      // Visual feedback
      const eventElement = document.querySelectorAll('.event-item')[index];
      if (eventElement) {
        eventElement.style.borderColor = 'var(--green-primary)';
        setTimeout(() => {
          eventElement.style.borderColor = '';
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Failed to highlight event:', error);
    }
  }
  
  // Handle clear button click
  function handleClearClick() {
    state.events = [];
    showEmptyState();
    
    // Reset scan button text
    elements.scanText.textContent = 'Scan for Events';
    
    trackEvent('events_cleared', {});
  }
  
  // Handle settings button click
  function handleSettingsClick() {
    // Open settings in new tab
    browser.tabs.create({
      url: browser.runtime.getURL('settings.html')
    });
  }
  
  // Handle keyboard shortcuts
  function handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      if (event.target === elements.scanBtn) {
        event.preventDefault();
        handleScanClick();
      }
    } else if (event.key === 'Escape') {
      window.close();
    }
  }
  
  // Show empty state
  function showEmptyState() {
    elements.emptyState.style.display = 'block';
    elements.eventsHeader.style.display = 'none';
    elements.errorState.style.display = 'none';
    
    // Clear events container
    const eventItems = elements.eventsContainer.querySelectorAll('.event-item');
    eventItems.forEach(el => el.remove());
  }
  
  // Show error message
  function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorState.style.display = 'block';
    elements.emptyState.style.display = 'none';
  }
  
  // Utility functions
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  function escapeForAttribute(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
  }
  
  function formatDate(dateStr) {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }
  
  function formatTime(timeStr) {
    if (!timeStr) return '';
    
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeStr;
    }
  }
  
  // Analytics tracking
  function trackEvent(event, data) {
    try {
      browser.runtime.sendMessage({
        action: 'trackAnalytics',
        event,
        data: {
          ...data,
          timestamp: Date.now(),
          source: 'popup'
        }
      });
    } catch (error) {
      console.log('Analytics tracking failed (non-critical):', error);
    }
  }
  
  // Initialize popup when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  console.log('✅ CALCLiK Safari popup script ready');
  
})();
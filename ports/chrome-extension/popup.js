document.addEventListener('DOMContentLoaded', async () => {
  const loading = document.getElementById('loading');
  const eventsDiv = document.getElementById('events');
  const settingsSection = document.getElementById('settingsSection');
  const calendarRadios = document.querySelectorAll('input[name="calendarType"]');

  const saveSettingsBtn = document.getElementById('saveSettings');
  const resetSettingsBtn = document.getElementById('resetSettings');
  const settingsToggle = document.getElementById('settingsToggle');
  const themeToggle = document.getElementById('themeToggle');
  const languageSelect = document.getElementById('languageSelect');
  const timezoneSelect = document.getElementById('timezoneSelect');

  // Load and apply locale/translations
  const currentLocale = await getCurrentLocale();
  languageSelect.value = currentLocale;
  applyTranslations(currentLocale);
  
  // Show/hide reset button based on language selection
  function updateResetButtonVisibility() {
    if (languageSelect.value !== 'en') {
      resetSettingsBtn.classList.remove('hidden');
    } else {
      resetSettingsBtn.classList.add('hidden');
    }
  }
  updateResetButtonVisibility();

  // Handle language selection change
  languageSelect.addEventListener('change', async (e) => {
    const newLocale = e.target.value;
    await saveLocale(newLocale);
    applyTranslations(newLocale);
    updateResetButtonVisibility();
  });

  // Handle reset to default button (always resets to English)
  resetSettingsBtn.addEventListener('click', async () => {
    if (confirm('Reset all settings to default (English)? This will refresh the extension.')) {
      await chrome.storage.sync.set({
        locale: 'en',
        calendarType: 'mac',
        dateFormat: 'iso',
        timeFormat: '12',
        timezoneValue: 'auto',
        hasSelectedCalendar: false,
        theme: 'dark'
      });
      location.reload();
    }
  });

  // Load and apply theme preference
  chrome.storage.sync.get(['theme'], (result) => {
    const theme = result.theme || 'dark';
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      themeToggle.textContent = '☀️';
    } else {
      themeToggle.textContent = '🌙';
    }
  });

  // Toggle theme
  themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    const newTheme = isLight ? 'light' : 'dark';
    themeToggle.textContent = isLight ? '☀️' : '🌙';
    chrome.storage.sync.set({ theme: newTheme }, () => {
      console.log('Theme changed to:', newTheme);
    });
  });

  // Define performScan function first
  async function performScan() {
    loading.classList.remove('hidden');
    eventsDiv.innerHTML = '';

    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Check if we can access this tab
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:')) {
        throw new Error('Cannot scan Chrome system pages. Please navigate to a regular webpage.');
      }
      
      // Check if this is a file URL and warn about permissions
      if (tab.url.startsWith('file://')) {
        const fileAccessEnabled = await chrome.extension.isAllowedFileSchemeAccess();
        if (!fileAccessEnabled) {
          throw new Error('File access not enabled. Go to chrome://extensions/, click Details on CalClik, and enable "Allow access to file URLs".');
        }
      }

      // Scan page
      const scanResult = await chrome.tabs.sendMessage(tab.id, { action: 'scanPage' }).catch(async (err) => {
        // Content script might not be injected yet, try injecting it
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        // Try again
        return await chrome.tabs.sendMessage(tab.id, { action: 'scanPage' });
      });

      console.log('Scan result:', scanResult);
      console.log('Potential events found:', scanResult.potentialEvents?.length || 0);

      if (!scanResult.potentialEvents || scanResult.potentialEvents.length === 0) {
        loading.classList.add('hidden');
        eventsDiv.innerHTML = '<p style="color: #b0b0b8; padding: 16px; text-align: center;">No dates or times found on this page. The page may not contain event information.</p>';
        return;
      }

      // Process with AI
      const processResult = await chrome.runtime.sendMessage({
        action: 'processEvents',
        potentialEvents: scanResult.potentialEvents
      });
      
      console.log('Process result:', processResult);

      loading.classList.add('hidden');

      if (processResult.error) {
        eventsDiv.innerHTML = `<p style="color: #ff6b6b; padding: 16px; background: rgba(255, 107, 107, 0.1); border-radius: 12px; border: 1px solid rgba(255, 107, 107, 0.3);">${processResult.error}</p>`;
        return;
      }

      const scanStartTime = performance.now();
      const events = processResult.events;
      
      if (events.length === 0) {
        eventsDiv.innerHTML = '<p style="color: #b0b0b8; padding: 16px; text-align: center;">No events found on this page. Try a page with event listings or dates.</p>';
        return;
      }

      // Show intelligence header and stats footer
      const intelligenceHeader = document.getElementById('intelligenceHeader');
      const settingsHeader = document.getElementById('settingsHeader');
      const eventsContainer = document.getElementById('eventsContainer');
      const statsFooter = document.getElementById('statsFooter');
      
      if (intelligenceHeader) {
        intelligenceHeader.style.display = 'flex';
        settingsHeader.style.display = 'none';
      }
      if (eventsContainer) eventsContainer.classList.remove('hidden');
      if (statsFooter) statsFooter.classList.remove('hidden');

    // Get saved preferences
    chrome.storage.sync.get(['calendarType', 'dateFormat', 'timeFormat', 'timezoneValue'], (result) => {
      const calendarType = result.calendarType || 'mac';
      const dateFormat = result.dateFormat || 'iso';
      const timeFormat = result.timeFormat || '12';
      const timezoneValue = result.timezoneValue || 'auto';
      
      // Store timezone info for calendar exports
      window.userTimezone = timezoneValue === 'auto' ? Intl.DateTimeFormat().resolvedOptions().timeZone : timezoneValue;
      
      // Calculate average confidence
      let totalConfidence = 0;
      
      events.forEach((event, index) => {
        const eventDiv = document.createElement('div');
        
        // Determine category and confidence
        const category = detectEventCategory(event);
        const confidence = calculateConfidence(event);
        totalConfidence += confidence;
        
        const confidenceLevel = confidence >= 90 ? 'high' : confidence >= 70 ? 'med' : 'low';
        const confidenceLabel = confidence >= 90 ? 'HIGH' : confidence >= 70 ? 'MED' : 'LOW';
        
        eventDiv.className = `event-card ${category}`;
        
        // Format date based on preference
        const formattedDate = formatDateDisplay(event.date, dateFormat);
        
        // Format time based on preference
        const formattedTime = formatTimeDisplay(event.time, timeFormat);
        
        // Generate category icon
        const categoryIcon = getCategoryIcon(category);
        
        // Generate auto tags
        const tags = generateEventTags(event, category);
        
        eventDiv.innerHTML = `
          <div class="confidence-badge">
            <span class="confidence-level ${confidenceLevel}">${confidenceLabel}</span>
            <span class="confidence-percent">${confidence.toFixed(1)}%</span>
          </div>
          
          <div class="event-header">
            <div class="event-icon">${categoryIcon}</div>
            <div class="event-info">
              <h3 class="event-title">${event.title || 'Event ' + (index + 1)}</h3>
              <div class="event-meta">
                ${formattedDate && formattedDate !== 'N/A' ? `
                  <div class="event-meta-row">
                    <svg fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/></svg>
                    <span>${formattedDate} ${formattedTime && formattedTime !== 'N/A' ? '— ' + formattedTime : ''}</span>
                  </div>
                ` : ''}
                ${event.location ? `
                  <div class="event-meta-row">
                    <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                    <span>${event.location}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
          
          ${tags.length > 0 ? `
            <div class="event-tags">
              ${tags.map(tag => `<span class="event-tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
          
          <div class="event-actions">
            <button class="action-button add-calendar-btn" data-index="${index}">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/></svg>
              Add
            </button>
            <button class="action-button share-btn" data-index="${index}">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/></svg>
            </button>
          </div>
        `;
        eventsDiv.appendChild(eventDiv);
      });
      
      // Update stats
      const avgConfidence = totalConfidence / events.length;
      const scanEndTime = performance.now();
      const scanTime = ((scanEndTime - scanStartTime) / 1000).toFixed(1);
      
      document.getElementById('eventCountDisplay').textContent = events.length;
      document.getElementById('statsEventsFound').textContent = events.length;
      document.getElementById('statsAvgConfidence').textContent = avgConfidence.toFixed(0) + '%';
      document.getElementById('statsScanTime').textContent = scanTime + 's';
      
      // Store events and add click handlers
      window.currentEvents = events;
      
      document.querySelectorAll('.add-calendar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          const event = window.currentEvents[index];
          
          // Route to appropriate calendar based on saved preference
          if (calendarType === 'mac') {
            addToMacCalendar(event);
          } else if (calendarType === 'google') {
            addToGoogleCalendar(event);
          } else if (calendarType === 'outlook') {
            addToOutlook(event);
          }
        });
      });
      
      // Add share button handlers
      document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          const event = window.currentEvents[index];
          shareEvent(event);
        });
      });
    });
    } catch (error) {
      loading.classList.add('hidden');
      eventsDiv.innerHTML = `<p style="color: #ff6b6b; padding: 16px; background: rgba(255, 107, 107, 0.1); border-radius: 12px; border: 1px solid rgba(255, 107, 107, 0.3);">${error.message}</p>`;
      console.error('Extension error:', error);
    }
  }

  function addToMacCalendar(event) {
    // Generate iCal and download for macOS Calendar
    const ical = generateICal(event);
    downloadICal(ical, `${event.title}.ics`);
    alert('iCal file downloaded. Import into your macOS Calendar app.');
  }

  function addToGoogleCalendar(event) {
    // Create Google Calendar event URL
    const startDateTime = `${event.date}T${event.time}:00`;
    const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString().slice(0, 19); // Add 1 hour
    
    // Build description with URL if available
    let description = event.description || '';
    if (event.url) {
      description += description ? '\n\n' : '';
      description += `Link: ${event.url}`;
    }
    
    const url = `https://calendar.google.com/calendar/event?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDateTime.replace(/[:-]/g, '')}/${endDateTime.replace(/[:-]/g, '')}&location=${encodeURIComponent(event.location || '')}&details=${encodeURIComponent(description)}`;
    chrome.tabs.create({ url: url });
  }

  function addToOutlook(event) {
    // Create Outlook calendar event URL
    const startDateTime = `${event.date}T${event.time}:00`;
    const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString().slice(0, 19); // Add 1 hour
    
    // Build description with URL if available
    let description = event.description || '';
    if (event.url) {
      description += description ? '\n\n' : '';
      description += `Link: ${event.url}`;
    }
    
    const url = `https://outlook.live.com/calendar/0/action/compose?subject=${encodeURIComponent(event.title)}&startdt=${startDateTime}&enddt=${endDateTime}&location=${encodeURIComponent(event.location || '')}&body=${encodeURIComponent(description)}`;
    chrome.tabs.create({ url: url });
  }

  function generateICal(event) {
    const now = new Date().toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
    
    // Parse event date and time properly
    const eventDateTime = new Date(`${event.date}T${event.time}:00`);
    
    // Format start time in local timezone (no Z suffix for local time)
    const start = `${event.date.replace(/-/g, '')}T${event.time.replace(':', '')}00`;
    
    // Default end time: 1 hour after start
    const endDateTime = new Date(eventDateTime.getTime() + 60 * 60 * 1000);
    const endDate = endDateTime.toISOString().split('T')[0].replace(/-/g, '');
    const endTime = endDateTime.toTimeString().substring(0, 5).replace(':', '') + '00';
    const end = `${endDate}T${endTime}`;
    
    // Build description with URL if available
    let description = event.description || '';
    if (event.url) {
      description += description ? '\n\n' : '';
      description += `Link: ${event.url}`;
    }
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CalClik//Event Scanner//EN
BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
DTSTAMP:${now}
SUMMARY:${event.title}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${event.location || ''}
END:VEVENT
END:VCALENDAR`;
  }

  function downloadICal(content, filename) {
    const blob = new Blob([content], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Format date based on user preference
  function formatDateDisplay(dateStr, format) {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      switch (format) {
        case 'us':
          return `${month}/${day}/${year}`;
        case 'eu':
          return `${day}/${month}/${year}`;
        case 'iso':
        default:
          return `${year}-${month}-${day}`;
      }
    } catch {
      return dateStr;
    }
  }

  // Format time based on user preference
  function formatTimeDisplay(timeStr, format) {
    if (!timeStr) return 'N/A';
    try {
      // timeStr is in 24h format HH:MM
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      if (format === '24') {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      } else {
        // Convert to 12-hour format
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
      }
    } catch {
      return timeStr;
    }
  }

  // Detect event category based on keywords
  function detectEventCategory(event) {
    const text = `${event.title} ${event.description} ${event.location}`.toLowerCase();
    
    if (text.match(/\b(tech|ai|ml|summit|conference|hackathon|coding|developer|software|digital)\b/)) return 'tech';
    if (text.match(/\b(art|exhibition|gallery|museum|painting|sculpture|artist)\b/)) return 'art';
    if (text.match(/\b(music|concert|jazz|rock|festival|band|live|performance)\b/)) return 'music';
    if (text.match(/\b(business|meeting|corporate|networking|seminar|workshop)\b/)) return 'business';
    if (text.match(/\b(sport|game|match|championship|tournament|fitness)\b/)) return 'sport';
    if (text.match(/\b(culture|cultural|theater|theatre|opera|ballet)\b/)) return 'culture';
    if (text.match(/\b(food|restaurant|dining|cuisine|culinary|tasting)\b/)) return 'food';
    
    return 'general';
  }
  
  // Calculate confidence score
  function calculateConfidence(event) {
    let score = 50; // Base score
    
    if (event.title && event.title.length > 5) score += 20;
    if (event.date) score += 15;
    if (event.time) score += 10;
    if (event.location) score += 15;
    if (event.description && event.description.length > 20) score += 10;
    if (event.url) score += 5;
    
    // Cap at 99.9%
    return Math.min(score, 99.9);
  }
  
  // Get category icon emoji
  function getCategoryIcon(category) {
    const icons = {
      tech: '💻',
      art: '🎨',
      music: '🎵',
      business: '💼',
      sport: '⚽',
      culture: '🎭',
      food: '🍽️',
      general: '📅'
    };
    return icons[category] || '📅';
  }
  
  // Generate auto tags for events
  function generateEventTags(event, category) {
    const tags = [];
    const text = `${event.title} ${event.description}`.toLowerCase();
    
    // Category tag
    tags.push(category.charAt(0).toUpperCase() + category.slice(1));
    
    // Detect additional tags based on keywords
    if (text.match(/\b(conference|summit)\b/)) tags.push('Conference');
    if (text.match(/\b(live|performance)\b/)) tags.push('Live');
    if (text.match(/\b(free|complimentary)\b/)) tags.push('Free');
    if (text.match(/\b(online|virtual|zoom|webinar)\b/)) tags.push('Online');
    if (text.match(/\b(workshop|training)\b/)) tags.push('Workshop');
    
    return tags.slice(0, 3); // Limit to 3 tags
  }
  
  // Share event (copy to clipboard)
  function shareEvent(event) {
    const shareText = `${event.title}\n📅 ${event.date}${event.time ? ' at ' + event.time : ''}\n📍 ${event.location || 'TBA'}${event.url ? '\n🔗 ' + event.url : ''}`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      // Show brief confirmation (you could add a toast notification here)
      console.log('Event copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }

  // Display current timezone
  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzDisplay = document.getElementById('currentTimezone');
  if (tzDisplay) tzDisplay.textContent = currentTz;

  // Load preferences (default to macOS Calendar, ISO date, 12-hour time, auto timezone)
  chrome.storage.sync.get(['calendarType', 'dateFormat', 'timeFormat', 'timezoneValue', 'hasSelectedCalendar'], (result) => {
    const calendarType = result.calendarType || 'mac';
    const dateFormat = result.dateFormat || 'iso';
    const timeFormat = result.timeFormat || '12';
    const timezoneValue = result.timezoneValue || 'auto';
    const hasSelected = result.hasSelectedCalendar || false;
    
    // Set the radio buttons
    const calRadio = document.querySelector(`input[name="calendarType"][value="${calendarType}"]`);
    if (calRadio) calRadio.checked = true;
    
    const dateRadio = document.querySelector(`input[name="dateFormat"][value="${dateFormat}"]`);
    if (dateRadio) dateRadio.checked = true;
    
    const timeRadio = document.querySelector(`input[name="timeFormat"][value="${timeFormat}"]`);
    if (timeRadio) timeRadio.checked = true;
    
    // Set timezone dropdown
    timezoneSelect.value = timezoneValue;
    
    // If user has already selected preferences, hide settings and auto-scan
    if (hasSelected) {
      settingsSection.classList.add('hidden');
      settingsToggle.classList.remove('hidden');
      performScan();
    }
  });

  // Save preferences when save button is clicked
  saveSettingsBtn.addEventListener('click', () => {
    console.log('Save button clicked');
    
    const calendarRadio = document.querySelector('input[name="calendarType"]:checked');
    const dateRadio = document.querySelector('input[name="dateFormat"]:checked');
    const timeRadio = document.querySelector('input[name="timeFormat"]:checked');
    
    if (!calendarRadio || !dateRadio || !timeRadio) {
      alert('Please select all preferences');
      return;
    }
    
    const calendarType = calendarRadio.value;
    const dateFormat = dateRadio.value;
    const timeFormat = timeRadio.value;
    const timezoneValue = timezoneSelect.value;
    const locale = languageSelect.value;
    
    console.log('Saving preferences:', { calendarType, dateFormat, timeFormat, timezoneValue, locale });
    
    chrome.storage.sync.set({ 
      calendarType: calendarType,
      dateFormat: dateFormat,
      timeFormat: timeFormat,
      timezoneValue: timezoneValue,
      locale: locale,
      hasSelectedCalendar: true 
    }, () => {
      console.log('Preferences saved');
      // Hide settings, show toggle, and start scanning
      settingsSection.classList.add('hidden');
      settingsToggle.classList.remove('hidden');
      console.log('About to call performScan');
      performScan();
    });
  });
  
  // Toggle settings visibility
  settingsToggle.addEventListener('click', () => {
    const isHidden = settingsSection.classList.contains('hidden');
    if (isHidden) {
      settingsSection.classList.remove('hidden');
      loading.classList.add('hidden');
      eventsDiv.innerHTML = '';
    } else {
      settingsSection.classList.add('hidden');
    }
  });

});

document.addEventListener('DOMContentLoaded', () => {
  const loading = document.getElementById('loading');
  const eventsDiv = document.getElementById('events');
  const settingsSection = document.getElementById('settingsSection');
  const calendarRadios = document.querySelectorAll('input[name="calendarType"]');

  const saveSettingsBtn = document.getElementById('saveSettings');
  const settingsToggle = document.getElementById('settingsToggle');
  const themeToggle = document.getElementById('themeToggle');

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

      const events = processResult.events;
      if (events.length === 0) {
        eventsDiv.innerHTML = '<p style="color: #b0b0b8; padding: 16px; text-align: center;">No events found on this page. Try a page with event listings or dates.</p>';
        return;
      }

    // Get saved preferences
    chrome.storage.sync.get(['calendarType', 'dateFormat', 'timeFormat'], (result) => {
      const calendarType = result.calendarType || 'mac';
      const dateFormat = result.dateFormat || 'iso';
      const timeFormat = result.timeFormat || '12';
      
      events.forEach((event, index) => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event';
        
        // Format date based on preference
        const formattedDate = formatDateDisplay(event.date, dateFormat);
        
        // Format time based on preference
        const formattedTime = formatTimeDisplay(event.time, timeFormat);
        
        // Determine button text based on calendar type
        let buttonText = 'Add to Calendar';
        if (calendarType === 'google') buttonText = 'Add to Google Calendar';
        if (calendarType === 'outlook') buttonText = 'Add to Outlook';
        
        eventDiv.innerHTML = `
          <h4>${event.title || 'Event ' + (index + 1)}</h4>
          <p><strong>Date:</strong> ${formattedDate || 'N/A'}</p>
          <p><strong>Time:</strong> ${formattedTime || 'N/A'}</p>
          <p><strong>Location:</strong> ${event.location || 'N/A'}</p>
          ${event.url ? `<p><strong>Link:</strong> <a href="${event.url}" target="_blank" style="color: #00cc6a; text-decoration: none;">${event.url}</a></p>` : ''}
          ${event.description ? `<p>${event.description}</p>` : ''}
          <button class="add-button" data-index="${index}">${buttonText}</button>
        `;
        eventsDiv.appendChild(eventDiv);
      });
      
      // Store events and add click handlers
      window.currentEvents = events;
      
      document.querySelectorAll('.add-button').forEach(btn => {
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

  // Load preferences (default to macOS Calendar, ISO date, 12-hour time)
  chrome.storage.sync.get(['calendarType', 'dateFormat', 'timeFormat', 'hasSelectedCalendar'], (result) => {
    const calendarType = result.calendarType || 'mac';
    const dateFormat = result.dateFormat || 'iso';
    const timeFormat = result.timeFormat || '12';
    const hasSelected = result.hasSelectedCalendar || false;
    
    // Set the radio buttons
    const calRadio = document.querySelector(`input[name="calendarType"][value="${calendarType}"]`);
    if (calRadio) calRadio.checked = true;
    
    const dateRadio = document.querySelector(`input[name="dateFormat"][value="${dateFormat}"]`);
    if (dateRadio) dateRadio.checked = true;
    
    const timeRadio = document.querySelector(`input[name="timeFormat"][value="${timeFormat}"]`);
    if (timeRadio) timeRadio.checked = true;
    
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
    
    console.log('Saving preferences:', { calendarType, dateFormat, timeFormat });
    
    chrome.storage.sync.set({ 
      calendarType: calendarType,
      dateFormat: dateFormat,
      timeFormat: timeFormat,
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

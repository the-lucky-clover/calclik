document.addEventListener('DOMContentLoaded', () => {
  const scanBtn = document.getElementById('scanBtn');
  const loading = document.getElementById('loading');
  const eventsDiv = document.getElementById('events');
  const apiKeyInput = document.getElementById('apiKey');
  const saveKeyBtn = document.getElementById('saveKey');
  const enableRemindersCheckbox = document.getElementById('enableReminders');

  // Load saved settings
  chrome.storage.sync.get(['openaiApiKey', 'enableReminders'], (result) => {
    if (result.openaiApiKey) {
      apiKeyInput.value = result.openaiApiKey;
    }
    enableRemindersCheckbox.checked = result.enableReminders || false;
  });

  saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value;
    const enableReminders = enableRemindersCheckbox.checked;
    chrome.storage.sync.set({ openaiApiKey: key, enableReminders: enableReminders }, () => {
      alert('Settings saved');
    });
  });

  scanBtn.addEventListener('click', async () => {
    loading.classList.remove('hidden');
    eventsDiv.innerHTML = '';

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Scan page
    const scanResult = await chrome.tabs.sendMessage(tab.id, { action: 'scanPage' });

    // Process with AI
    const processResult = await chrome.runtime.sendMessage({
      action: 'processEvents',
      potentialEvents: scanResult.potentialEvents
    });

    loading.classList.add('hidden');

    if (processResult.error) {
      eventsDiv.innerHTML = `<p>Error: ${processResult.error}</p>`;
      return;
    }

    const events = processResult.events;
    if (events.length === 0) {
      eventsDiv.innerHTML = '<p>No events found</p>';
      return;
    }

    events.forEach((event, index) => {
      const eventDiv = document.createElement('div');
      eventDiv.className = 'event';
      let buttonsHtml = `<button class="addMacCalendarBtn" data-event='${JSON.stringify(event)}'>Add to macOS Calendar</button>`;
      if (enableRemindersCheckbox.checked) {
        buttonsHtml += `<button class="addReminderBtn" data-event='${JSON.stringify(event)}'>Add to macOS Reminders</button>`;
      }
      buttonsHtml += `<button class="addGoogleBtn" data-event='${JSON.stringify(event)}'>Add to Google Calendar</button>`;
      buttonsHtml += `<button class="addOutlookBtn" data-event='${JSON.stringify(event)}'>Add to Outlook</button>`;
      eventDiv.innerHTML = `
        <h4>${event.title || 'Event ' + (index + 1)}</h4>
        <p>Date: ${event.date || 'N/A'}</p>
        <p>Time: ${event.time || 'N/A'}</p>
        <p>Location: ${event.location || 'N/A'}</p>
        <p>${event.description || ''}</p>
        ${buttonsHtml}
      `;
      eventsDiv.appendChild(eventDiv);
    });

    // Add event listeners for add buttons
    document.querySelectorAll('.addMacCalendarBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const event = JSON.parse(e.target.dataset.event);
        addToMacCalendar(event);
      });
    });

    document.querySelectorAll('.addReminderBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const event = JSON.parse(e.target.dataset.event);
        addToReminders(event);
      });
    });

    document.querySelectorAll('.addGoogleBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const event = JSON.parse(e.target.dataset.event);
        addToGoogleCalendar(event);
      });
    });

    document.querySelectorAll('.addOutlookBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const event = JSON.parse(e.target.dataset.event);
        addToOutlook(event);
      });
    });
  });

  function addToMacCalendar(event) {
    // Generate iCal and download for macOS Calendar
    const ical = generateICal(event);
    downloadICal(ical, `${event.title}.ics`);
    alert('iCal file downloaded. Import into your macOS Calendar app.');
  }

  function addToGoogleCalendar(event) {
    // Create Google Calendar event URL
    const startDateTime = `${event.date}T${event.time}:00`;
    const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString().slice(0, 16); // Add 1 hour
    const url = `https://calendar.google.com/calendar/event?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDateTime.replace(/[:-]/g, '')}/${endDateTime.replace(/[:-]/g, '')}&location=${encodeURIComponent(event.location || '')}&description=${encodeURIComponent(event.description || '')}`;
    window.open(url, '_blank');
  }

  function addToOutlook(event) {
    // Create Outlook calendar event URL
    const startDateTime = `${event.date}T${event.time}:00`;
    const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString().slice(0, 16); // Add 1 hour
    const url = `https://outlook.live.com/calendar/0/action/compose?subject=${encodeURIComponent(event.title)}&startdt=${startDateTime}&enddt=${endDateTime}&location=${encodeURIComponent(event.location || '')}&body=${encodeURIComponent(event.description || '')}`;
    window.open(url, '_blank');
  }

  function generateICal(event) {
    const now = new Date().toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
    const start = `${event.date.replace(/-/g, '')}T${event.time.replace(':', '')}00Z`;
    return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${start}
DTSTAMP:${now}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
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

  function addToReminders(event) {
    // Copy event details to clipboard for manual addition to Reminders
    const reminderText = `${event.title}\nDate: ${event.date}\nTime: ${event.time}\nLocation: ${event.location}\n${event.description}`;
    navigator.clipboard.writeText(reminderText).then(() => {
      alert('Event details copied to clipboard. Paste into Reminders app to add.');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy to clipboard. Please copy manually: ' + reminderText);
    });
  }
});

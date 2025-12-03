// Content script to scan page for events
function scanForEvents() {
  const bodyText = document.body.innerText;
  const pageTitle = document.title;
  const pageUrl = window.location.href;

  // Simple regex for date/time patterns
  const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/gi;
  const timeRegex = /\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b/gi;

  const dates = bodyText.match(dateRegex) || [];
  const times = bodyText.match(timeRegex) || [];

  // Extract potential event text around dates
  const potentialEvents = [];
  const sentences = bodyText.split(/[.!?]+/);

  sentences.forEach(sentence => {
    if (dateRegex.test(sentence) || timeRegex.test(sentence)) {
      potentialEvents.push(sentence.trim());
    }
  });

  return {
    title: pageTitle,
    url: pageUrl,
    dates: [...new Set(dates)],
    times: [...new Set(times)],
    potentialEvents: potentialEvents.slice(0, 10) // Limit to 10
  };
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanPage') {
    const events = scanForEvents();
    sendResponse(events);
  }
});

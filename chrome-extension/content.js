// Content script to scan page for events
function scanForEvents() {
  const bodyText = document.body.innerText;
  const pageTitle = document.title;
  const pageUrl = window.location.href;

  console.log('Scanning page:', pageTitle);
  console.log('Body text length:', bodyText.length);
  console.log('First 500 chars:', bodyText.substring(0, 500));

  // Simple regex for date/time patterns
  const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi;
  const timeRegex = /\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b/gi;

  const dates = bodyText.match(dateRegex) || [];
  const times = bodyText.match(timeRegex) || [];

  console.log('Dates found:', dates);
  console.log('Times found:', times);

  // Extract potential event text around dates - use smarter extraction
  const potentialEvents = [];
  
  // Try to extract from structured HTML first (.event class, article tags, etc.)
  const eventElements = document.querySelectorAll('.event, article, [class*="event"], [id*="event"]');
  if (eventElements.length > 0) {
    console.log('Found', eventElements.length, 'event-like elements');
    eventElements.forEach((elem, idx) => {
      const elemText = elem.innerText;
      const datePat = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i;
      const timePat = /\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b/i;
      
      if (datePat.test(elemText) || timePat.test(elemText)) {
        const cleanedBlock = elemText.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n');
        console.log(`[CONTENT] Event element ${idx}:`, cleanedBlock.substring(0, 150));
        potentialEvents.push(cleanedBlock);
      }
    });
  }
  
  // Fallback: split by paragraph breaks if no structured elements found
  if (potentialEvents.length === 0) {
    const blocks = bodyText.split(/\n\s*\n+/);
    console.log('Using fallback - Total blocks:', blocks.length);

    blocks.forEach((block, idx) => {
      const datePat = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i;
      const timePat = /\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b/i;
      
      if (datePat.test(block) || timePat.test(block)) {
        const cleanedBlock = block.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n');
        console.log(`[CONTENT] Block ${idx}:`, cleanedBlock.substring(0, 150));
        potentialEvents.push(cleanedBlock);
      }
    });
  }

  console.log('Potential events found:', potentialEvents.length);
  console.log('Potential events:', potentialEvents);

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
    console.log('Content script: Scanning page...');
    const events = scanForEvents();
    console.log('Content script: Found', events.potentialEvents.length, 'potential events');
    sendResponse(events);
    return true; // Keep the message channel open
  }
});

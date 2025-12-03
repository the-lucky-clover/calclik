// Background service worker for event processing
console.log('CalClik background service worker loaded');

// Process events using regex-based extraction
async function processEvents(potentialEvents) {
  console.log('Processing', potentialEvents.length, 'potential events');
  const events = [];
  
  for (const text of potentialEvents) {
    const event = extractEvent(text);
    if (event) {
      events.push(event);
    }
  }
  
  console.log('Extracted', events.length, 'events');
  return events;
}

// Extract event information using regex patterns
function extractEvent(text) {
  // Extract URLs from text
  const urlRegex = /https?:\/\/[^\s<>"]+/gi;
  const urls = text.match(urlRegex) || [];
  
  // Extract title first to remove it from description later
  let extractedTitle = '';
  const firstLineMatch = text.match(/^([^\r\n]+)/);
  if (firstLineMatch && firstLineMatch[1].trim()) {
    const firstLine = firstLineMatch[1].trim();
    const descriptionStarters = /^(?:The event|This|Don't miss|Come|Register|RSVP|Bring|Please|All|Location:|Time:|Date:|Where:|When:)\b/i;
    if (firstLine.length < 150 && !descriptionStarters.test(firstLine)) {
      extractedTitle = firstLine;
    }
  }
  
  // Remove title from text for description
  let descriptionText = text;
  if (extractedTitle) {
    descriptionText = text.substring(extractedTitle.length).trim();
  }
  
  const event = {
    title: '',
    date: '',
    time: '',
    location: '',
    description: descriptionText.substring(0, 200) + (descriptionText.length > 200 ? '...' : ''),
    url: urls.length > 0 ? urls[0] : ''
  };
  
  // Extract date - support multiple formats (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, Month DD YYYY, DD Month YYYY)
  const datePatterns = [
    /\b(\d{4}-\d{2}-\d{2})\b/i,  // ISO: 2026-02-01
    /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/i,  // MM/DD/YYYY or DD/MM/YYYY
    /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})\b/i,  // Month DD, YYYY
    /\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*,?\s+\d{4})\b/i  // DD Month YYYY
  ];
  
  for (const pattern of datePatterns) {
    const dateMatch = text.match(pattern);
    if (dateMatch) {
      event.date = formatDate(dateMatch[0]);
      break;
    }
  }
  
  // Extract time - support 12h and 24h formats with optional timezone
  const timePatterns = [
    /\b(\d{1,2}:\d{2})\s*(?:AM|PM|am|pm)?\s*(?:PST|EST|CST|MST|PDT|EDT|CDT|MDT|GMT|UTC|CET)?\b/i,
    /\b(\d{1,2}:\d{2})\b/i
  ];
  
  for (const pattern of timePatterns) {
    const timeMatch = text.match(pattern);
    if (timeMatch) {
      event.time = formatTime(timeMatch[0]);
      break;
    }
  }
  
  // Extract location - look for various location patterns
  let location = '';
  
  // Pattern 1: "Location:" followed by text (highest priority)
  const locationPattern1 = /Location:\s*([^\n.]+)/i;
  const locMatch1 = text.match(locationPattern1);
  if (locMatch1) {
    location = locMatch1[1].trim();
  }
  
  // Pattern 2: "held at", "be held at", "will be held at" (specific venue indicators)
  if (!location) {
    const heldAtPattern = /(?:held|be held|will be held)\s+(?:at|in)\s+(?:the\s+)?([^.]+?)(?=\.|Don't|Please|Bring|RSVP|All|$)/i;
    const heldMatch = text.match(heldAtPattern);
    if (heldMatch) {
      location = heldMatch[1].trim();
    }
  }
  
  // Pattern 3: Common venue types (Hotel, Center, Convention Center, etc.)
  if (!location) {
    const venuePattern = /\b(?:at|in)\s+(?:the\s+)?([A-Z][a-zA-Z\s]+?(?:Hotel|Center|Centre|Building|Office|Room|Hall|Ballroom|Convention Center|Auditorium|Theater|Theatre|Park|Plaza|Arena|Stadium|Headquarters))/i;
    const venueMatch = text.match(venuePattern);
    if (venueMatch) {
      location = venueMatch[1].trim();
    }
  }
  
  // Pattern 4: "at [Capitalized Location]" appearing after the time
  if (!location) {
    const afterTimePattern = /\d{1,2}:\d{2}\s*(?:AM|PM|am|pm).*?(?:at|in)\s+(?:the\s+)?([A-Z][a-zA-Z\s]+?)(?=\.|Don't|Please|Bring|RSVP|All|$)/i;
    const afterTimeMatch = text.match(afterTimePattern);
    if (afterTimeMatch) {
      location = afterTimeMatch[1].trim();
    }
  }
  
  event.location = location.substring(0, 100);
  
  // Generate title - extract only the event name, not description
  let titleText = text;
  
  console.log('[TITLE] Processing text:', text.substring(0, 200));
  
  // First, check for line breaks - title is typically on first line
  const firstLineMatch = titleText.match(/^([^\r\n]+)/);
  console.log('[TITLE] First line match:', firstLineMatch ? firstLineMatch[1] : 'NONE');
  
  if (firstLineMatch && firstLineMatch[1].trim()) {
    // Check if first line looks like a title (not too long, not starting with description words)
    const firstLine = firstLineMatch[1].trim();
    const descriptionStarters = /^(?:The event|This|Don't miss|Come|Register|RSVP|Bring|Please|All|Location:|Time:|Date:|Where:|When:)\b/i;
    
    console.log('[TITLE] First line:', firstLine);
    console.log('[TITLE] Length:', firstLine.length, '< 150?', firstLine.length < 150);
    console.log('[TITLE] Is description starter?', descriptionStarters.test(firstLine));
    
    if (firstLine.length < 150 && !descriptionStarters.test(firstLine)) {
      // First line is the title - use it directly without further processing
      titleText = firstLine;
      // Clean up and return immediately
      event.title = titleText
        .replace(/[,.:;!?-]+$/, '')
        .trim()
        .substring(0, 100);
      console.log('[TITLE] Using first line as title:', event.title);
      return event.title ? event : null;
    }
  }
  
  console.log('[TITLE] First line rejected, using fallback logic');
  
  // Fallback: If first line didn't work, extract from description text
  // Remove common prefixes
  titleText = titleText.replace(/^(?:Join us for an?|Annual|Virtual|Interactive)\s+/i, '');
  
  // Try to extract text before date/time or common separators
  const dateTimePattern = /\b(?:on|scheduled for|happening|set for|taking place|at)\s+(?:\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}|\d{1,2}:\d{2})/i;
  const dateTimeMatch = titleText.match(dateTimePattern);
  
  if (dateTimeMatch) {
    // Get text before the date/time
    titleText = titleText.substring(0, dateTimeMatch.index).trim();
  } else {
    // Look for text before common description starters
    const descriptionPattern = /\b(?:The event|This|Don't miss|Come|Register|RSVP|Bring|Please|All|Location:|Time:|Date:)\b/i;
    const descMatch = titleText.match(descriptionPattern);
    if (descMatch) {
      titleText = titleText.substring(0, descMatch.index).trim();
    }
  }
  
  // If still too long or empty, take first 3-5 meaningful words
  if (!titleText || titleText.length > 80) {
    const words = titleText.split(/\s+/).filter(w => w.length > 0);
    titleText = words.slice(0, Math.min(5, words.length)).join(' ');
  }
  
  // Clean up title - remove trailing punctuation and limit length
  event.title = titleText
    .replace(/[,.:;!?-]+$/, '')
    .trim()
    .substring(0, 100); // Allow longer titles for full event names
  
  return event.title ? event : null;
}

// Helper functions for date/time formatting
function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

function formatTime(timeStr) {
  try {
    const time = timeStr.replace(/\s*(AM|PM|am|pm)/i, ' $1');
    const date = new Date(`1970-01-01 ${time}`);
    if (isNaN(date.getTime())) {
      return timeStr;
    }
    return date.toTimeString().substring(0, 5);
  } catch {
    return timeStr;
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processEvents') {
    processEvents(request.potentialEvents).then(events => {
      sendResponse({ events });
    }).catch(error => {
      console.error('Processing error:', error);
      sendResponse({ events: [] });
    });
    return true; // Keep message channel open for async response
  }
});

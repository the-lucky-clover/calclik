// Background service worker for AI processing using Transformers.js
let pipeline = null;
let tokenizer = null;

// Initialize the AI models
async function initializeAI() {
  try {
    // Import Transformers.js
    const { pipeline: createPipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');
    
    // Initialize NER pipeline for event extraction
    pipeline = await createPipeline('token-classification', 'Xenova/bert-base-NER');
    
    console.log('AI models loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load AI models:', error);
    return false;
  }
}

// Process events using local AI
async function processWithTransformers(potentialEvents) {
  if (!pipeline) {
    const initialized = await initializeAI();
    if (!initialized) {
      return []; // Fallback to empty array if AI fails
    }
  }

  const events = [];
  
  for (const text of potentialEvents) {
    try {
      // Use NER to extract entities
      const entities = await pipeline(text);
      
      // Process the entities to extract event information
      const event = extractEventFromEntities(text, entities);
      if (event) {
        events.push(event);
      }
    } catch (error) {
      console.error('Error processing text:', error);
      // Fallback to regex-based extraction
      const fallbackEvent = extractEventFallback(text);
      if (fallbackEvent) {
        events.push(fallbackEvent);
      }
    }
  }
  
  return events;
}

// Extract event information from NER entities
function extractEventFromEntities(text, entities) {
  const event = {
    title: '',
    date: '',
    time: '',
    location: '',
    description: text.substring(0, 200) + (text.length > 200 ? '...' : '')
  };
  
  // Extract locations
  const locations = entities.filter(e => e.entity.includes('LOC')).map(e => e.word);
  if (locations.length > 0) {
    event.location = locations.join(' ').replace(/##/g, '');
  }
  
  // Extract organizations as potential event names
  const organizations = entities.filter(e => e.entity.includes('ORG')).map(e => e.word);
  if (organizations.length > 0) {
    event.title = organizations.join(' ').replace(/##/g, '');
  }
  
  // Use regex for dates and times since NER might not catch them well
  const dateMatch = text.match(/\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/i);
  if (dateMatch) {
    event.date = formatDate(dateMatch[0]);
  }
  
  const timeMatch = text.match(/\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b/i);
  if (timeMatch) {
    event.time = formatTime(timeMatch[0]);
  }
  
  // Generate title if not found
  if (!event.title) {
    const words = text.split(' ').slice(0, 6);
    event.title = words.join(' ').replace(/[^\w\s]/g, '').trim();
  }
  
  // Only return event if we have at least a title
  return event.title ? event : null;
}

// Fallback extraction using regex patterns
function extractEventFallback(text) {
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
  
  // Extract potential location (words after "at", "in", "@")
  const locationMatch = text.match(/(?:at|in|@)\s+([A-Z][a-zA-Z\s]+(?:[A-Z][a-zA-Z\s]*)*)/i);
  if (locationMatch) {
    event.location = locationMatch[1].trim().substring(0, 50);
  }
  
  // Generate title from first few words
  const words = text.split(' ').slice(0, 6);
  event.title = words.join(' ').replace(/[^\w\s]/g, '').trim();
  
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
    processWithTransformers(request.potentialEvents).then(events => {
      sendResponse({ events });
    }).catch(error => {
      console.error('Processing error:', error);
      sendResponse({ events: [] });
    });
    return true; // Keep message channel open for async response
  }
});

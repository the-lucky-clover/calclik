// CALCLiK Safari Extension - Background Script
// Privacy-first event extraction using local AI

// Initialize extension
browser.runtime.onInstalled.addListener(() => {
  console.log('🚀 CALCLiK Safari Extension installed');
  
  // Set default settings
  browser.storage.sync.set({
    'CALCLiK-settings': {
      version: '2.0.0',
      aiModel: 'transformers-js',
      analyticsEnabled: true,
      privacyMode: true
    }
  });
});

// Handle messages from content script and popup
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('📨 Background received message:', message.action);
  
  switch (message.action) {
    case 'extractEvents':
      try {
        const events = await processEventsWithLocalAI(message.textData);
        sendResponse({ success: true, events });
      } catch (error) {
        console.error('❌ Event extraction failed:', error);
        sendResponse({ success: false, error: error.message });
      }
      break;
      
    case 'trackAnalytics':
      if (message.event && message.data) {
        trackEvent(message.event, message.data);
        sendResponse({ success: true });
      }
      break;
      
    case 'getSettings':
      const settings = await browser.storage.sync.get('CALCLiK-settings');
      sendResponse({ settings: settings['CALCLiK-settings'] });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true; // Keep message channel open for async response
});

// Local AI Processing using Transformers.js
async function processEventsWithLocalAI(textData) {
  try {
    console.log('🤖 Starting local AI event extraction...');
    
    // Load Transformers.js for Safari
    if (typeof transformers === 'undefined') {
      await loadTransformersJS();
    }
    
    // Extract events using local NER model
    const events = await extractEventsFromText(textData);
    
    console.log(`✅ Extracted ${events.length} events locally`);
    return events;
    
  } catch (error) {
    console.error('❌ Local AI processing failed:', error);
    return fallbackEventExtraction(textData);
  }
}

// Load Transformers.js library for local AI
async function loadTransformersJS() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0/dist/transformers.min.js';
    script.type = 'module';
    
    script.onload = () => {
      console.log('✅ Transformers.js loaded for Safari');
      resolve();
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Transformers.js');
      reject(new Error('Failed to load AI library'));
    };
    
    document.head.appendChild(script);
  });
}

// Extract events using local AI model
async function extractEventsFromText(text) {
  try {
    // Use Transformers.js NER pipeline for event extraction
    const extractor = await transformers.pipeline('token-classification', 
      'Xenova/bert-base-NER', { quantized: true });
    
    // Extract named entities
    const entities = await extractor(text);
    
    // Process entities into structured events
    const events = processEntitiesIntoEvents(entities, text);
    
    return events;
    
  } catch (error) {
    console.error('❌ AI extraction error:', error);
    return fallbackEventExtraction(text);
  }
}

// Process NER entities into structured event objects
function processEntitiesIntoEvents(entities, originalText) {
  const events = [];
  const datePattern = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})|(\w+ \d{1,2},? \d{4})/gi;
  const timePattern = /(\d{1,2}:\d{2}(?:\s*[AaPp][Mm])?)/g;
  
  // Find dates and times in text
  const dates = originalText.match(datePattern) || [];
  const times = originalText.match(timePattern) || [];
  
  // Extract locations and organizations from entities
  const locations = entities
    .filter(e => e.entity.includes('LOC'))
    .map(e => e.word)
    .filter(word => word.length > 2);
    
  const organizations = entities
    .filter(e => e.entity.includes('ORG'))
    .map(e => e.word);
  
  // Create events from found patterns
  dates.forEach((date, index) => {
    const time = times[index] || '';
    const location = locations[index] || '';
    
    // Extract title from surrounding context
    const title = extractEventTitle(originalText, date);
    
    if (title && title.length > 3) {
      events.push({
        title: cleanText(title),
        date: formatDate(date),
        time: formatTime(time),
        location: cleanText(location),
        description: extractEventDescription(originalText, title),
        source: 'local-ai',
        confidence: calculateConfidence(title, date, time, location)
      });
    }
  });
  
  return events.filter(event => event.confidence > 0.3);
}

// Fallback event extraction using regex patterns
function fallbackEventExtraction(text) {
  console.log('🔄 Using fallback event extraction...');
  
  const events = [];
  const eventPatterns = [
    /(?:event|meeting|conference|workshop|seminar|webinar)[^.!?]*(?:[.!?]|$)/gi,
    /(?:join us|save the date|mark your calendar)[^.!?]*(?:[.!?]|$)/gi,
    /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}[^.!?]*(?:[.!?]|$)/gi
  ];
  
  eventPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      const event = parseEventFromText(match);
      if (event.title) {
        events.push({
          ...event,
          source: 'fallback',
          confidence: 0.6
        });
      }
    });
  });
  
  return events.slice(0, 5); // Limit to 5 events
}

// Parse individual event from text snippet
function parseEventFromText(text) {
  const dateMatch = text.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/);
  const timeMatch = text.match(/\d{1,2}:\d{2}(?:\s*[AaPp][Mm])?/);
  
  return {
    title: cleanText(text.substring(0, 100)),
    date: dateMatch ? formatDate(dateMatch[0]) : '',
    time: timeMatch ? formatTime(timeMatch[0]) : '',
    location: '',
    description: cleanText(text)
  };
}

// Utility functions
function extractEventTitle(text, nearDate) {
  const dateIndex = text.indexOf(nearDate);
  const beforeDate = text.substring(Math.max(0, dateIndex - 100), dateIndex);
  const afterDate = text.substring(dateIndex, dateIndex + 100);
  
  // Look for title-like text before or after the date
  const titlePatterns = [
    /([A-Z][^.!?]*(?:event|meeting|conference|workshop|seminar))/i,
    /([A-Z][^.!?]{10,50})/
  ];
  
  for (const pattern of titlePatterns) {
    const beforeMatch = beforeDate.match(pattern);
    if (beforeMatch) return beforeMatch[1].trim();
    
    const afterMatch = afterDate.match(pattern);
    if (afterMatch) return afterMatch[1].trim();
  }
  
  return text.substring(dateIndex - 30, dateIndex + 30).trim();
}

function extractEventDescription(text, title) {
  const titleIndex = text.indexOf(title);
  if (titleIndex === -1) return title;
  
  const start = Math.max(0, titleIndex - 50);
  const end = Math.min(text.length, titleIndex + title.length + 100);
  
  return cleanText(text.substring(start, end));
}

function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  
  // Convert to 24-hour format
  const time = timeStr.trim().toLowerCase();
  if (time.includes('pm') && !time.startsWith('12')) {
    const [hours, minutes] = time.replace('pm', '').split(':');
    return `${parseInt(hours) + 12}:${minutes.padStart(2, '0')}`;
  } else if (time.includes('am') && time.startsWith('12')) {
    return time.replace('12', '00').replace('am', '').trim();
  }
  
  return time.replace(/[ap]m/g, '').trim();
}

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,!?-]/g, '')
    .trim()
    .substring(0, 200);
}

function calculateConfidence(title, date, time, location) {
  let confidence = 0;
  
  if (title && title.length > 5) confidence += 0.3;
  if (date) confidence += 0.3;
  if (time) confidence += 0.2;
  if (location) confidence += 0.2;
  
  // Boost confidence for event keywords
  const eventKeywords = ['event', 'meeting', 'conference', 'workshop', 'seminar'];
  if (eventKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
    confidence += 0.2;
  }
  
  return Math.min(confidence, 1.0);
}

// Analytics tracking (privacy-first)
function trackEvent(event, data) {
  const settings = browser.storage.sync.get('CALCLiK-settings');
  if (!settings['CALCLiK-settings']?.analyticsEnabled) return;
  
  // Only track anonymous usage statistics
  const eventData = {
    event,
    timestamp: Date.now(),
    data: {
      // Only non-identifying data
      action: data.action,
      success: data.success,
      eventCount: data.eventCount,
      source: 'safari-extension'
    }
  };
  
  // Store locally for privacy
  browser.storage.local.get('analytics-events').then(result => {
    const events = result['analytics-events'] || [];
    events.push(eventData);
    
    // Keep only last 100 events
    const recentEvents = events.slice(-100);
    browser.storage.local.set({ 'analytics-events': recentEvents });
  });
}

// Handle browser action click
browser.browserAction.onClicked.addListener((tab) => {
  // Open popup (handled automatically by manifest)
  console.log('🖱️ CALCLiK icon clicked');
});

console.log('🍎 CALCLiK Safari Extension background script loaded');
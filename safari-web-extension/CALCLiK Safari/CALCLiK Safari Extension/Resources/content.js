// CALCLiK Safari Extension - Content Script
// Scans web pages for events using privacy-first local AI

(() => {
  'use strict';
  
  console.log('🔍 CALCLiK Safari content script loaded');
  
  // Configuration
  const CONFIG = {
    maxTextLength: 10000,
    scanDelay: 1000,
    datePatterns: [
      /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/g,
      /\b(\w+ \d{1,2},? \d{4})\b/g,
      /\b(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/g
    ],
    timePatterns: [
      /\b(\d{1,2}:\d{2}(?:\s*[AaPp][Mm])?)\b/g,
      /\b(\d{1,2}\s*[AaPp][Mm])\b/g
    ],
    eventKeywords: [
      'event', 'meeting', 'conference', 'workshop', 'seminar', 'webinar',
      'summit', 'symposium', 'convention', 'gathering', 'celebration',
      'festival', 'concert', 'show', 'performance', 'exhibition'
    ]
  };
  
  // State management
  let scanResults = {
    events: [],
    lastScan: null,
    isScanning: false
  };
  
  // Auto-scan page on load (with delay)
  setTimeout(() => {
    if (shouldAutoScan()) {
      performQuickScan();
    }
  }, CONFIG.scanDelay);
  
  // Listen for messages from popup
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Content script received:', message.action);
    
    switch (message.action) {
      case 'scanPage':
        handlePageScan()
          .then(result => sendResponse(result))
          .catch(error => sendResponse({ success: false, error: error.message }));
        break;
        
      case 'getPageInfo':
        sendResponse({
          success: true,
          pageInfo: {
            url: window.location.href,
            title: document.title,
            domain: window.location.hostname,
            hasEvents: scanResults.events.length > 0
          }
        });
        break;
        
      case 'highlightEvents':
        highlightEventsOnPage(message.events);
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
    
    return true; // Keep message channel open
  });
  
  // Main page scanning function
  async function handlePageScan() {
    if (scanResults.isScanning) {
      return { success: false, error: 'Scan already in progress' };
    }
    
    try {
      scanResults.isScanning = true;
      console.log('🔍 Starting page scan...');
      
      // Extract text content from page
      const textData = extractPageText();
      
      if (!textData || textData.length < 50) {
        return { success: false, error: 'Not enough text content found' };
      }
      
      // Send to background script for AI processing
      const result = await browser.runtime.sendMessage({
        action: 'extractEvents',
        textData: textData
      });
      
      if (result.success && result.events) {
        scanResults.events = result.events;
        scanResults.lastScan = new Date().toISOString();
        
        console.log(`✅ Found ${result.events.length} events`);
        
        // Track successful scan
        browser.runtime.sendMessage({
          action: 'trackAnalytics',
          event: 'page_scan',
          data: {
            action: 'scan_complete',
            success: true,
            eventCount: result.events.length,
            domain: window.location.hostname
          }
        });
        
        return {
          success: true,
          events: result.events,
          pageInfo: {
            url: window.location.href,
            title: document.title,
            domain: window.location.hostname
          }
        };
      } else {
        throw new Error(result.error || 'No events found');
      }
      
    } catch (error) {
      console.error('❌ Page scan failed:', error);
      
      // Track failed scan
      browser.runtime.sendMessage({
        action: 'trackAnalytics',
        event: 'page_scan',
        data: {
          action: 'scan_failed',
          success: false,
          error: error.message
        }
      });
      
      return { success: false, error: error.message };
    } finally {
      scanResults.isScanning = false;
    }
  }
  
  // Extract relevant text content from the page
  function extractPageText() {
    // Remove script, style, and other non-content elements
    const excludeSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 
      '.menu', '.navigation', '.sidebar', '.ads',
      '[style*="display: none"]', '[style*="visibility: hidden"]'
    ];
    
    // Clone document to avoid modifying original
    const docClone = document.cloneNode(true);
    
    // Remove excluded elements
    excludeSelectors.forEach(selector => {
      const elements = docClone.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    // Get text content from main content areas
    const contentSelectors = [
      'main', 'article', '.content', '.main-content',
      '.post', '.entry', '.description', 'p', 'div'
    ];
    
    let textContent = '';
    
    for (const selector of contentSelectors) {
      const elements = docClone.querySelectorAll(selector);
      elements.forEach(element => {
        const text = element.textContent || '';
        if (text.length > 20 && hasEventIndicators(text)) {
          textContent += text + ' ';
        }
      });
      
      // Break early if we have enough content
      if (textContent.length > CONFIG.maxTextLength) break;
    }
    
    // Fallback to body text if no content found
    if (textContent.length < 100) {
      textContent = docClone.body?.textContent || '';
    }
    
    // Clean and limit text
    return cleanText(textContent).substring(0, CONFIG.maxTextLength);
  }
  
  // Check if text contains event indicators
  function hasEventIndicators(text) {
    const lowerText = text.toLowerCase();
    
    // Check for event keywords
    const hasEventKeywords = CONFIG.eventKeywords.some(keyword => 
      lowerText.includes(keyword)
    );
    
    // Check for date patterns
    const hasDatePatterns = CONFIG.datePatterns.some(pattern => 
      pattern.test(text)
    );
    
    // Check for time patterns
    const hasTimePatterns = CONFIG.timePatterns.some(pattern => 
      pattern.test(text)
    );
    
    return hasEventKeywords || (hasDatePatterns && hasTimePatterns);
  }
  
  // Quick scan for auto-detection
  function performQuickScan() {
    const pageText = extractPageText();
    
    if (hasEventIndicators(pageText)) {
      console.log('🎯 Potential events detected on page');
      
      // Show subtle indicator that events might be available
      showEventIndicator();
    }
  }
  
  // Show visual indicator for potential events
  function showEventIndicator() {
    // Only show if not already shown
    if (document.getElementById('CALCLiK-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.id = 'CALCLiK-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #00ff88, #00cc6a);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
      cursor: pointer;
      transition: all 0.3s ease;
      animation: slideIn 0.5s ease-out;
    `;
    
    indicator.innerHTML = '📅 Events detected - Click CALCLiK to scan';
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.style.animation = 'slideIn 0.5s ease-out reverse';
        setTimeout(() => indicator.remove(), 500);
      }
    }, 5000);
    
    document.body.appendChild(indicator);
  }
  
  // Highlight events on page
  function highlightEventsOnPage(events) {
    // Remove existing highlights
    document.querySelectorAll('.CALCLiK-highlight').forEach(el => {
      el.classList.remove('CALCLiK-highlight');
    });
    
    events.forEach((event, index) => {
      if (event.title) {
        highlightTextOnPage(event.title, `event-${index}`);
      }
      if (event.date) {
        highlightTextOnPage(event.date, `date-${index}`);
      }
    });
    
    // Add highlight styles
    if (!document.getElementById('CALCLiK-highlight-styles')) {
      const style = document.createElement('style');
      style.id = 'CALCLiK-highlight-styles';
      style.textContent = `
        .CALCLiK-highlight {
          background: rgba(0, 255, 136, 0.2) !important;
          border-radius: 3px !important;
          padding: 1px 2px !important;
          transition: all 0.3s ease !important;
        }
        .CALCLiK-highlight:hover {
          background: rgba(0, 255, 136, 0.4) !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Highlight specific text on page
  function highlightTextOnPage(searchText, className) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
      if (node.textContent.includes(searchText)) {
        textNodes.push(node);
      }
    }
    
    textNodes.forEach(textNode => {
      const parent = textNode.parentNode;
      if (parent && !parent.classList.contains('CALCLiK-highlight')) {
        parent.classList.add('CALCLiK-highlight', className);
      }
    });
  }
  
  // Utility functions
  function shouldAutoScan() {
    // Don't auto-scan on certain domains
    const excludeDomains = ['google.com', 'facebook.com', 'twitter.com'];
    const currentDomain = window.location.hostname;
    
    return !excludeDomains.some(domain => currentDomain.includes(domain));
  }
  
  function cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?:\/\-]/g, '')
      .trim();
  }
  
  // Page change detection for SPAs
  let currentUrl = window.location.href;
  
  setInterval(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      console.log('🔄 Page changed, resetting scan results');
      
      scanResults = {
        events: [],
        lastScan: null,
        isScanning: false
      };
      
      // Auto-scan new page after delay
      setTimeout(() => {
        if (shouldAutoScan()) {
          performQuickScan();
        }
      }, CONFIG.scanDelay);
    }
  }, 2000);
  
  console.log('✅ CALCLiK Safari content script ready');
  
})();
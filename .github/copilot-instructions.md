# CalClik - Smart Event Scanner: AI Agent Instructions

## Project Architecture

**CalClik** is a browser extension that scans web pages for events using AI and adds them to various calendar platforms. The project has three main components:

### 1. Chrome Extension (`chrome-extension/`)
- **Manifest V3** with service worker architecture
- **Content Script** (`content.js`): Scans pages with regex patterns for dates/times, extracts potential event text
- **Background Service Worker** (`background.js`): Handles OpenAI API calls for event extraction
- **Popup Interface** (`popup.js`): Main UI with calendar integration buttons
- **Native Messaging Host** (`host/`): Node.js script using AppleScript for macOS Reminders integration

### 2. Safari Extension (`safari-extension/`)
- **Manifest V2** for Safari compatibility
- Similar structure but without native messaging (uses direct macOS integration)
- Targets Safari 14.0+ minimum

### 3. Landing Page (`landing-page/`)
- Static marketing site with glassmorphism design and tropical theme
- Deployed to Cloudflare Pages

## Key Development Patterns

### Extension Communication Flow
1. User clicks scan → `popup.js` sends message to content script
2. `content.js` scans page DOM for date/time patterns and potential event text
3. `popup.js` sends extracted text to background script for AI processing
4. `background.js` calls OpenAI API with structured prompt for event extraction
5. Results displayed in popup with platform-specific calendar integration buttons

### Calendar Integration Strategy
- **macOS Calendar**: Generate and download iCal files (`.ics`)
- **macOS Reminders**: Native messaging host with AppleScript execution
- **Google/Outlook**: Deep links using platform-specific URL schemes with pre-filled parameters

### AI Processing Pattern
The extension uses Hugging Face Transformers.js with a local NER (Named Entity Recognition) model in `background.js` to extract events with structured fields: `title`, `date` (YYYY-MM-DD), `time` (HH:MM), `location`, `description`. Processing happens entirely client-side with no external API calls.

## Critical Development Workflows

### Extension Development Setup
```bash
# Chrome: Load unpacked extension from chrome://extensions/
# Safari: Enable extension in Safari Preferences > Extensions
```

### Native Messaging Setup (Chrome only)
```bash
mkdir -p ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/
cp chrome-extension/host/com.calendare.reminderhost.json ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/
# Update manifest with actual extension ID
```

### Landing Page Deployment
```bash
cd landing-page
wrangler pages deploy .
```

## Project-Specific Conventions

### Event Data Structure
All events follow this structure across the codebase:
```javascript
{
  title: string,
  date: "YYYY-MM-DD",
  time: "HH:MM",
  location: string,
  description: string
}
```

### Extension Messaging Pattern
- Content script uses `chrome.runtime.onMessage` for page scanning
- Background script uses async message handling with `return true` for API calls
- Storage uses `chrome.storage.sync` for API keys and settings

### Calendar URL Generation
- Google Calendar: `calendar.google.com/calendar/event?action=TEMPLATE`
- Outlook: `outlook.live.com/calendar/0/action/compose`
- Both use ISO datetime format converted to respective URL parameters

## Integration Points

### External Dependencies
- **Hugging Face Transformers.js**: Free client-side AI inference for event extraction (no API key required)
- **Native Host**: Node.js script for macOS Reminders integration
- **Cloudflare Pages**: Static site hosting with global CDN

### Cross-Component Communication
- Extension popup ↔ content script: Chrome messaging API
- Extension ↔ native host: Chrome native messaging (JSON over stdin/stdout)
- Landing page ↔ extensions: Independent deployment, shared branding only

## File Patterns to Follow

### When adding calendar integrations
- Add button generation in `popup.js` event display logic
- Implement URL scheme function following `addToGoogleCalendar()` pattern
- Test with actual event data structure

### When modifying AI processing
- Update model configuration in `background.js` `processWithTransformers()` function
- Maintain JSON response format for frontend compatibility
- Models are cached locally after first download for offline usage

### When updating extension manifest
- Chrome: Use Manifest V3 patterns with service worker
- Safari: Use Manifest V2 patterns with background scripts array
- Maintain permission parity where possible between platforms
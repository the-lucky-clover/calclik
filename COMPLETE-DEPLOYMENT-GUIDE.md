# 🚀 CALCLiK Complete Deployment Guide

## Table of Contents
1. [Chrome Extension Testing](#chrome-extension-testing)
2. [Safari Extension Porting](#safari-extension-porting)
3. [Mac App Store Submission](#mac-app-store-submission)
4. [Logo Generation Prompts](#logo-generation-prompts)

---

## Chrome Extension Testing

### ✅ Extension Overview

CALCLiK is an AI-powered event scanner that:
- Scans web pages for events using local AI (Transformers.js NER)
- Extracts dates, times, locations, and descriptions
- Adds events to Google Calendar, Outlook, or macOS Calendar
- Processes everything locally for privacy

### Test Page Verification

The test page at [`test-events.html`](test-events.html) contains various event formats:

| Event | Date Format | Time | Location |
|-------|-------------|------|----------|
| Tech Conference 2025 | December 15, 2025 | 9:00 AM | Silicon Valley Convention Center |
| Holiday Party | 2025-12-20 | 7:30 PM | Grand Ballroom at Marriott Hotel |
| Product Launch Meeting | Jan 10, 2026 | 2:15 PM | Conference Room A, Building 2 |
| Webinar: Future of AI | 01/22/2026 | 11:00 AM - 12:30 PM | Online via Zoom |
| Team Building Workshop | Feb 5, 2026 | 1:00 PM - 5:00 PM | Outdoor Adventure Park |

### Installation Steps

```bash
# 1. Navigate to Chrome extensions
chrome://extensions/

# 2. Enable Developer Mode (toggle in top-right)

# 3. Click "Load unpacked"

# 4. Select the chrome-extension/ folder
```

### Testing Checklist

- [ ] Extension icon appears in toolbar
- [ ] Popup opens with modern dark UI
- [ ] "Scan Current Tab" button works
- [ ] Events are detected with dates, times, locations
- [ ] Calendar platform buttons work
- [ ] Events open in Google Calendar/Outlook correctly
- [ ] iCal downloads work for macOS Calendar

---

## Safari Extension Porting

### Architecture Differences

| Feature | Chrome (Manifest V3) | Safari |
|---------|---------------------|--------|
| Background | Service Worker | Safari Extension Handler (Swift) |
| API | `chrome.*` | `browser.*` (WebExtension) |
| Packaging | .zip / .crx | macOS App Bundle |
| Distribution | Chrome Web Store | Mac App Store |
| Signing | Google Developer Account | Apple Developer Account ($99/year) |

### Safari Extension Structure

The Safari extension has already been ported and is located at:

```
safari-web-extension/
├── SAFARI-DEPLOYMENT-GUIDE.md     # Detailed deployment instructions
├── XCODE-PROJECT-SETUP.md         # Xcode configuration guide
├── CALCLiK Safari/                 # Main app container
│   ├── AppDelegate.swift
│   ├── ViewController.swift
│   ├── Info.plist
│   └── CalClik_Safari.entitlements
└── CALCLiK Safari Extension/       # Safari extension
    ├── SafariExtensionHandler.swift
    ├── SafariExtensionViewController.swift
    └── Resources/
        ├── background.js
        ├── content.js
        ├── popup.html
        ├── popup.js
        └── manifest.json
```

### Key Code Changes for Safari

#### 1. API Namespace Change

```javascript
// Chrome
chrome.runtime.sendMessage({ action: 'processEvents' })

// Safari
browser.runtime.sendMessage({ action: 'processEvents' })
```

#### 2. Background Script Changes

Safari uses `browser.*` APIs and requires modifications for ServiceWorker:

```javascript
// Safari background.js uses:
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  // Handle messages
  return true; // Keep channel open
});
```

#### 3. Manifest Format

Safari uses Manifest V2 style with Safari-specific keys:

```json
{
  "manifest_version": 2,
  "browser_action": {
    "default_popup": "popup.html"
  },
  "safari": {
    "strict_min_version": "14.0"
  }
}
```

### Building Safari Extension

#### Step 1: Create Xcode Project

```bash
# Open Xcode
# Create New Project → macOS → Safari Extension App
# Product Name: CALCLiK Safari
# Bundle Identifier: com.calclik.safari
```

#### Step 2: Copy Extension Resources

```bash
# Copy JavaScript and HTML files to Resources folder
cp -r safari-web-extension/CALCLiK\ Safari/* [XCODE_PROJECT]/
```

#### Step 3: Configure Build Settings

```
Main App Target:
├── Deployment Target: macOS 12.0
├── Bundle Identifier: com.calclik.safari
└── Signing: Mac App Distribution

Extension Target:
├── Deployment Target: macOS 12.0
├── Bundle Identifier: com.calclik.safari.extension
└── App Sandbox: Enabled
    ├── Network Client: ✓
    └── Network Server: ✓
```

#### Step 4: Build and Test

```bash
# In Xcode:
# 1. Select CALCLiK Safari scheme
# 2. Choose "My Mac" as destination
# 3. Press Cmd+R to build and run
```

#### Step 5: Enable in Safari

1. Open Safari
2. Safari → Preferences → Extensions
3. Enable "CALCLiK Safari Extension"
4. Allow on all websites

---

## Mac App Store Submission

### Prerequisites

| Requirement | Details |
|-------------|---------|
| Apple Developer Account | $99/year at [developer.apple.com](https://developer.apple.com) |
| Xcode 14+ | Latest version from Mac App Store |
| macOS 12.0+ | Monterey or newer |
| App Icons | 1024x1024 PNG (no transparency) |
| Screenshots | 5 different Mac screen sizes |

### Step-by-Step Submission Process

#### Step 1: Prepare App Store Assets

**Required Screenshots (PNG format):**
- 1280 x 800 (MacBook Air)
- 1440 x 900 (MacBook Pro 13")
- 1680 x 1050 (MacBook Pro 16")
- 1920 x 1080 (iMac 21.5")
- 2560 x 1440 (iMac 27")

**App Icon Sizes:**
- 16x16, 32x32, 64x64, 128x128
- 256x256, 512x512, 1024x1024

#### Step 2: Create Archive

```bash
# In Xcode:
# 1. Select "Any Mac" as build destination
# 2. Product → Archive
# 3. Wait for build to complete (5-10 minutes)
```

#### Step 3: Upload to App Store Connect

```bash
# In Xcode Organizer:
# 1. Select your archive
# 2. Click "Distribute App"
# 3. Choose "App Store Connect"
# 4. Upload → Next → Next → Upload
# 5. Wait for processing (30-60 minutes)
```

#### Step 4: Configure in App Store Connect

1. **Login**: [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **Create New App**: My Apps → + → New App
3. **Fill App Information**:

```
App Name: CALCLiK - Smart Event Scanner
Primary Language: English
Bundle ID: com.calclik.safari
SKU: calclik-safari-2025

Categories:
├── Primary: Productivity
└── Secondary: Utilities

Price: Free (recommended for launch)
Availability: All territories
```

#### Step 5: Write App Store Description

```markdown
**App Name**: CALCLiK - Smart Event Scanner

**Subtitle**: AI-powered event discovery for your calendar

**Description**:
CALCLiK scans any webpage for events and adds them to your calendar instantly. 
Using advanced AI that runs locally on your Mac, CALCLiK finds events, meetings, 
and important dates without sending your data anywhere.

KEY FEATURES:
• AI-powered event detection on any website
• Privacy-first: All processing happens locally
• One-click calendar integration (Google, Outlook, macOS)
• Smart event parsing with dates, times, locations
• Works offline after initial setup
• No registration or API keys required

Perfect for students, professionals, and anyone who wants to stay organized 
without compromising privacy.

**Keywords**:
calendar, events, AI, productivity, privacy, Safari, extension, meetings, schedule

**Support URL**: https://calclik.pages.dev/support
**Marketing URL**: https://calclik.pages.dev
```

#### Step 6: Privacy Information

```
Data Collection: None
├── CALCLiK processes all data locally
├── No personal information collected
└── No external analytics or tracking

Third-party SDKs: None
Content Rights: All rights owned
```

#### Step 7: Submit for Review

1. Complete all required fields (indicated by red)
2. Add build from uploaded archive
3. Click "Submit for Review"
4. Wait for approval (typically 1-7 days)

### Common Rejection Reasons & Fixes

| Rejection | Solution |
|-----------|----------|
| "App crashes on launch" | Test on clean macOS install |
| "Missing functionality" | Add comprehensive screenshots & demo video |
| "Privacy concerns" | Update privacy policy, explain local processing |
| "Design guidelines" | Follow macOS Human Interface Guidelines |

### Post-Submission Timeline

| Day | Status |
|-----|--------|
| 0 | Submitted for Review |
| 1-2 | In Review |
| 2-5 | Additional Information (if needed) |
| 3-7 | Approved / Ready for Sale |

---

## Logo Generation Prompts

### Modern Greyscale Isometric 3D Logo Prompt

For text-to-image AI tools (Midjourney, DALL-E, Stable Diffusion):

#### Primary Prompt (Recommended):

```
Modern minimalist isometric 3D logo for "CALCLiK" calendar app, 
greyscale monochrome color palette, elegant geometric design featuring 
a stylized calendar icon with checkmark or click cursor element, 
clean sharp edges, subtle depth and shadows, corporate professional aesthetic, 
vector style suitable for app icon, white background, 
high contrast, simple memorable silhouette, tech startup branding
--style raw --ar 1:1
```

#### Alternative Prompts:

**Prompt 2 - More Abstract:**
```
Isometric 3D abstract logo mark for productivity app CALCLiK, 
greyscale gradient, interlocking geometric shapes suggesting calendar grid 
and digital interaction, modern tech aesthetic, minimal clean design, 
subtle dimensionality, dark grey to light grey tones, 
professional SaaS branding, isolated on white, 
scalable vector-like quality
--style raw --ar 1:1
```

**Prompt 3 - Calendar Focus:**
```
Premium 3D isometric calendar icon logo in greyscale, 
checkmark element integrated, modern flat design with depth, 
professional app branding for CALCLiK, 
monochromatic grey scale palette from #333333 to #CCCCCC, 
clean minimalist corporate style, geometric precision, 
subtle shadows and highlights, crisp edges, white background
--style raw --ar 1:1
```

**Prompt 4 - Tech/AI Emphasis:**
```
Futuristic isometric 3D logo combining calendar and AI brain elements, 
greyscale metallic finish, modern tech startup branding for CALCLiK, 
interconnected geometric nodes suggesting smart scheduling, 
clean professional design, minimal complexity, 
high contrast black white grey only, 
suitable for iOS app icon, polished corporate aesthetic
--style raw --ar 1:1
```

### Logo Specifications

| Property | Value |
|----------|-------|
| Style | Isometric 3D |
| Colors | Greyscale only (#000000 to #FFFFFF) |
| Aspect Ratio | 1:1 (square) |
| Format | PNG with transparency |
| Min Size | 1024x1024 px |
| Elements | Calendar + Click/Check interaction |

### Recommended Generation Settings

**For Midjourney:**
```
--style raw --ar 1:1 --v 6 --stylize 50
```

**For DALL-E 3:**
- Style: Natural
- Size: 1024x1024

**For Stable Diffusion:**
```
Negative prompt: colorful, rainbow, text, letters, words, 
watermark, blurry, low quality, complex, busy
Steps: 30-50
CFG Scale: 7-9
```

---

## Quick Reference Commands

### Chrome Extension Development

```bash
# Package extension for Chrome Web Store
cd chrome-extension
zip -r ../calclik-chrome-extension.zip . -x "*.DS_Store"
```

### Safari Extension Development

```bash
# Convert Chrome extension to Safari (Apple tool)
xcrun safari-web-extension-converter chrome-extension/ \
  --project-location safari-web-extension/ \
  --app-name "CALCLiK Safari"
```

### Testing Commands

```bash
# Start local server for testing
cd landing-page && python3 -m http.server 8000

# Open test page
open http://localhost:8000/test-events.html
```

---

## Support & Resources

- **Landing Page**: [calclik.pages.dev](https://calclik.pages.dev)
- **Apple Developer Docs**: [Safari App Extensions](https://developer.apple.com/documentation/safariservices/safari_app_extensions)
- **App Store Guidelines**: [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Human Interface Guidelines**: [macOS HIG](https://developer.apple.com/design/human-interface-guidelines/macos)

---

**Document Version**: 1.0.0  
**Last Updated**: November 27, 2025  
**Compatibility**: Chrome 88+, Safari 15+, macOS 12.0+
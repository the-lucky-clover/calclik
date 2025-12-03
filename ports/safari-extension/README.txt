# CALCLiK Safari Extension - Setup Guide (Beta)

## ⚠️ Beta Notice
This is a beta version of CALCLiK for Safari. It requires Xcode to build and install.

## 🍎 System Requirements
- macOS 11.0 (Big Sur) or later
- Safari 14.0 or later  
- Xcode 12.0 or later (free from Mac App Store)
- Apple Developer account (free registration)

## 🚀 Installation Steps

### Step 1: Install Xcode
1. Open Mac App Store
2. Search for "Xcode" and install it (this may take a while - it's large!)
3. Launch Xcode and accept the license agreement
4. Install additional components when prompted

### Step 2: Extract CALCLiK
1. Extract the `CALCLiK-safari-extension.zip` file
2. Open the folder - you should see the Safari extension files

### Step 3: Build the Extension (Manual Method)
Since this is a beta version, we need to manually create the Safari extension:

1. **Open Safari Extension Development**:
   - Open Safari
   - Go to Safari menu > Preferences > Advanced
   - Check "Show Develop menu in menu bar"

2. **Create Extension Bundle**:
   - In Finder, create a new folder called `CALCLiK.safariextension`
   - Copy all files from the extracted folder into this new folder
   - The folder should contain: `manifest.json`, `background.js`, `content.js`, `popup.html`, `popup.js`, and `icons/`

3. **Load in Safari**:
   - Open Safari
   - Go to Develop menu > Show Extension Builder
   - Click the "+" button to add an extension
   - Select the `CALCLiK.safariextension` folder
   - Click "Install" when prompted

### Step 4: Enable Extension
1. Open Safari Preferences (⌘,)
2. Go to the "Extensions" tab
3. Find "CALCLiK" in the list
4. Check the box to enable it
5. The CALCLiK icon should appear in Safari's toolbar

## 🎯 How to Use

### Basic Scanning:
1. **Navigate to any webpage** with events
2. **Click the CALCLiK toolbar icon**
3. **Click "Scan Page"** in the popup
4. **Review detected events**
5. **Add to Calendar**:
   - 📅 **iCal Download** - Works with all macOS calendar apps
   - 🌐 **Google Calendar** - Opens in web browser
   - 📆 **Outlook** - Opens in web browser

### Safari-Specific Features:
- **Native macOS Integration**: iCal files open directly in Calendar.app
- **Privacy Enhanced**: Safari's built-in tracking protection works with CALCLiK
- **Optimized Performance**: Tuned for Safari's JavaScript engine

## 🔧 Troubleshooting

### Extension Builder Not Found:
- Ensure "Show Develop menu" is enabled in Safari Preferences
- Restart Safari after enabling

### Extension Won't Load:
- Check that all files are in the `.safariextension` folder
- Verify `manifest.json` is present and valid
- Try restarting Safari

### No Events Detected:
- Same troubleshooting as Chrome version
- Try pages like Facebook Events, Meetup, restaurant sites

### Performance Issues:
- First scan downloads AI models (one-time setup)
- Subsequent scans are faster
- Safari may show security prompts for the AI model downloads

## 🛑 Known Limitations (Beta)

- ❌ **No Native Reminders Integration** (Safari doesn't support native messaging)
- ❌ **Manual Installation Required** (not yet on Safari Extensions Gallery)
- ⚠️ **Limited Error Reporting** (beta status)
- ⚠️ **May Break on Safari Updates** (beta compatibility)

## 🔄 Future Updates

We're working on:
- 📱 **Safari Extensions Gallery Listing**
- 🏗️ **Automated Xcode Build Process** 
- 🔗 **Native Reminders Support** (when Safari APIs allow)
- 🚀 **Performance Optimizations**

## 📧 Beta Feedback

Your feedback helps improve CALCLiK for Safari!

**Send feedback to**: safari-beta@calclik.pages.dev

Include:
- macOS version
- Safari version  
- What websites you tested
- Any errors or issues encountered

## 🌟 Privacy & Security

✅ **100% Local Processing** - AI runs entirely in Safari
✅ **No External Dependencies** - Works offline after setup
✅ **Safari's Built-in Protection** - Enhanced privacy controls
✅ **Open Source** - Transparent and auditable

---
**Version**: 1.1.0-beta | **Safari**: 14.0+ | **macOS**: 11.0+

**Note**: This beta will be replaced by a Mac App Store version when Apple approves our submission.
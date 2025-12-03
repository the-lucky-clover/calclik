# CALCLiK Chrome/Brave Extension - Quick Setup Guide

## 🚀 Installation Steps

### Step 1: Download & Extract
1. You've already downloaded the `CALCLiK-chrome-extension.zip` file
2. Extract it to a folder on your computer (e.g., Desktop/CALCLiK)

### Step 2: Open Chrome/Brave Extensions
1. Open Chrome or Brave browser
2. Navigate to:
   - **Chrome**: `chrome://extensions/`
   - **Brave**: `brave://extensions/`

### Step 3: Enable Developer Mode
1. Find the "Developer mode" toggle in the top right
2. Click to enable it (should turn blue/green)

### Step 4: Load the Extension
1. Click "Load unpacked" button (appears after enabling developer mode)
2. Select the CALCLiK folder you extracted in Step 1
3. Click "Select Folder"

### Step 5: Verify Installation
1. You should see CALCLiK appear in your extensions list
2. The CALCLiK icon should appear in your browser toolbar
3. Click the extension icon to open the popup

## 🎯 How to Use CALCLiK

### Basic Scanning:
1. **Navigate to any webpage** with events (like Facebook events, Eventbrite, restaurant websites, etc.)
2. **Click the CALCLiK extension icon** in your browser toolbar
3. **Click "Scan Page"** - the AI will analyze the page content
4. **Review detected events** - CALCLiK shows structured event information
5. **Add to Calendar** - Choose from multiple calendar options:
   - 📅 **Google Calendar** - Opens in new tab with pre-filled details
   - 📆 **Outlook Calendar** - Opens Outlook web with event details
   - 💾 **Download iCal** - Save .ics file for any calendar app
   - 📝 **macOS Reminders** - Native integration (setup required)

### Advanced Features:

#### macOS Reminders Integration (Optional):
1. **Copy native messaging files** to Chrome's directory:
   ```bash
   mkdir -p ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/
   cp host/com.CALCLiK.reminderhost.json ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/
   ```

2. **Update the manifest** with your extension ID:
   - Go to `chrome://extensions/` and find CALCLiK's Extension ID
   - Edit `com.CALCLiK.reminderhost.json` 
   - Replace `YOUR_EXTENSION_ID_HERE` with your actual extension ID

3. **Enable Reminders Integration** in the CALCLiK popup
4. **"Add to Reminders"** button will now create native macOS reminders

## 🔧 Troubleshooting

### Extension Not Loading:
- Ensure you selected the correct folder containing `manifest.json`
- Check that Developer mode is enabled
- Try refreshing the extensions page and reloading

### No Events Found:
- Try different webpages with clear date/time information
- Events work best on pages like Facebook Events, Meetup, Eventbrite
- Restaurant websites, conference sites, and news articles also work well

### Reminders Not Working:
- Verify you followed the native messaging setup steps exactly
- Check that your extension ID is correct in the JSON file
- Restart Chrome/Brave after setup

### Performance Tips:
- First scan may take longer as AI models download (happens once)
- Subsequent scans are much faster
- All processing happens locally - no internet required after setup

## 🌟 Privacy & Security

✅ **100% Local Processing** - AI runs entirely in your browser
✅ **No API Keys Required** - No external service dependencies  
✅ **No Data Collection** - Your information never leaves your device
✅ **Open Source** - Full transparency in how it works

## 📧 Support

Need help? Contact us at: support@calclik.pages.dev

## 🔄 Updates

CALCLiK auto-updates through the Chrome Web Store once published. For now, check [calclik.pages.dev](https://calclik.pages.dev) for new versions.

---
**Version**: 1.1.0 | **Compatibility**: Chrome 88+, Brave 1.0+, Edge 88+
# CALCLiK for Linux

CALCLiK works on all major Linux browsers. Choose the installation method for your browser below.

## Supported Browsers on Linux

### Chromium-based Browsers

- Google Chrome
- Chromium
- Brave
- Microsoft Edge
- Opera
- Vivaldi
- Any Chromium-based browser

### Firefox

- Mozilla Firefox
- Firefox ESR

## Installation Instructions

### For Chrome/Chromium/Brave (Recommended)

1. **Download** the Chrome extension package:
   - Download `calclik-chrome-extension.zip` from the website
   - Extract the zip file to a permanent location (e.g., `~/Applications/calclik-chrome/`)

2. **Install in Browser**:
   - Open your Chromium browser
   - Navigate to `chrome://extensions/` (or `brave://extensions/` for Brave)
   - Enable "Developer mode" toggle in the top-right corner
   - Click "Load unpacked"
   - Select the extracted `calclik-chrome-extension` folder
   - The CALCLiK icon will appear in your toolbar

3. **Pin the Extension** (Optional):
   - Click the puzzle piece icon in your toolbar
   - Find CALCLiK in the list
   - Click the pin icon to keep it visible

### For Firefox

1. **Download** the Firefox extension:
   - Download `calclik-firefox-extension.xpi` from the website

2. **Install in Firefox**:
   - Open Firefox
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select the downloaded `.xpi` file
   - The extension will be installed temporarily

3. **Permanent Installation** (Advanced):
   - Firefox requires signed extensions for permanent installation
   - For development: Keep loading as temporary add-on
   - For production: Wait for Mozilla Add-ons store release

### For Microsoft Edge on Linux

1. **Download** the Edge extension:
   - Download `calclik-edge-extension.zip` from the website
   - Extract to a permanent location

2. **Install**:
   - Open Microsoft Edge
   - Navigate to `edge://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extracted folder

## Features

All features work identically on Linux:

- ✅ AI-powered event detection
- ✅ Local processing (no API key needed)
- ✅ Calendar export (.ics format)
- ✅ Google Calendar integration
- ✅ Privacy-first design

## Permissions

CALCLiK requests these permissions:

- **activeTab**: To scan the current webpage
- **storage**: To save your preferences
- **tabs**: To detect webpage changes
- **scripting**: To inject the scanning script

## Troubleshooting

### Extension won't load

- Ensure you're using a supported browser version
- Try re-extracting the zip file
- Check browser console for errors

### Events not detected

- Ensure the webpage contains date/time information
- Try rescanning the page
- Some dynamic websites may require a page refresh

- Refresh the page and try again

### Calendar export not working

- Ensure you have a calendar app installed (GNOME Calendar, Thunderbird, etc.)
- The extension generates standard .ics files compatible with all calendar apps
- You can manually import the .ics file into your calendar app

## System Requirements

- **Linux Distribution**: Any modern distribution (Ubuntu, Fedora, Arch, Debian, etc.)
- **Browser**:
  - Name and version (e.g., "Chrome 120")
- **Desktop Environment**: Any (GNOME, KDE, XFCE, etc.)
- **RAM**: 2GB minimum (for AI processing)

## Calendar Integration on Linux

### GNOME Calendar

1. Click "Add to Calendar" in CALCLiK
2. Download the .ics file
3. Open GNOME Calendar
4. Click "+" or drag and drop the .ics file
5. Event appears in GNOME Calendar

### Thunderbird Lightning

1. Click "Add to Calendar" in CALCLiK
2. Download the .ics file
3. Open Thunderbird
4. Go to Calendar tab
5. File → Import → Select the .ics file
6. Import the .ics file

### KOrganizer

1. Click "Add to Calendar" in CALCLiK
2. Download the .ics file
3. Open KOrganizer
4. File → Import → Import Calendar
5. Select the .ics file
6. KOrganizer will import the event

### Evolution

1. Click "Add to Calendar" in CALCLiK
2. Download the .ics file
3. Open Evolution
4. File → Import → Select the .ics file

## Privacy on Linux

CALCLiK is built with privacy first:

- All processing happens locally in your browser
- No data sent to external servers
- No telemetry or analytics
- Open source - audit the code yourself
- Works offline after initial model download

## Performance on Linux

- **First run**: Downloads AI model (~50MB)
- **Subsequent runs**: Instant - model cached locally
- **CPU usage**: Minimal - optimized for efficiency
- **RAM usage**: ~100-200MB for AI processing

## Support

- **GitHub**: <https://github.com/the-lucky-clover/calclik>
- **Issues**: <https://github.com/the-lucky-clover/calclik/issues>
- **Community**: <https://github.com/the-lucky-clover/calclik/discussions>
- **Documentation**: <https://github.com/the-lucky-clover/calclik/wiki>

## Contributing

Contributions welcome! See our GitHub repository for details:

- Fork the repository

## License

See LICENSE file in the repository root.

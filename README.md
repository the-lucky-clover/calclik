# CALCLiK - Smart Event Scanner

CALCLiK is a privacy-first browser extension that scans web pages for events and adds them to your calendar using local AI-powered detection. No API keys required - everything runs in your browser.

## Features

- 🔍 **Smart Scanning**: AI-powered detection of events from any webpage
- 📅 **Multi-Platform Calendar Integration**: Add events to macOS Calendar, Reminders, Google Calendar, or Outlook
- 🌴 **Tropical Theme**: Relaxing island-inspired interface
- ⚡ **Lightning Fast**: Instant results with advanced processing

## Project Structure

```
calendare/
├── chrome-extension/     # Chrome extension files
├── safari-extension/     # Safari extension files
├── landing-page/         # Marketing website
└── README.md
```

## Chrome Extension Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `chrome-extension` folder
4. The extension will be installed and ready to use

### Free AI Processing

CALCLiK uses local AI models for event detection - no API keys required:

1. Click the CALCLiK extension icon
2. The AI models will download automatically on first use
3. All processing happens locally in your browser for maximum privacy

### Reminders Integration Setup (Chrome)

For automatic Reminders creation on macOS:

1. Copy the host files to the correct location:
   ```bash
   mkdir -p ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/
   cp chrome-extension/host/com.calendare.reminderhost.json ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/
   ```
2. Update the manifest with your extension ID:
   - Find your extension ID in `chrome://extensions/`
   - Edit `com.calendare.reminderhost.json` and replace `YOUR_EXTENSION_ID_HERE` with your actual extension ID
3. In the extension popup, check "Enable Reminders Integration"
4. The "Add to Reminders" button will now automatically create reminders in the Reminders app

## Safari Extension Setup

For the Safari version (available on Mac App Store):

1. Download from Mac App Store
2. Open Safari and enable the extension in Preferences > Extensions
3. The extension integrates directly with macOS Calendar and Reminders

## Landing Page

The landing page is a static site with glassmorphism design and tropical theme.

### Local Development

```bash
cd landing-page
# Open index.html in your browser
open index.html
```

### Deployment to Cloudflare Pages

Cloudflare Pages provides free hosting for static sites with global CDN.

#### Prerequisites

- Cloudflare account
- Wrangler CLI installed: `npm install -g wrangler`

#### Deployment Steps

1. **Install Wrangler** (if not already):
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler auth login
   ```

3. **Initialize Pages Project**:
   ```bash
   cd landing-page
   wrangler pages init calendare-landing
   ```

4. **Configure wrangler.toml**:
   ```toml
   name = "calendare-landing"
   compatibility_date = "2023-12-01"

   [env.production]
   route = "https://calendare.pages.dev/*"
   ```

5. **Deploy to Cloudflare Pages**:
   ```bash
   wrangler pages deploy .
   ```

6. **Set up Custom Domain** (optional):
   - Go to Cloudflare Dashboard > Pages
   - Select your project
   - Go to Custom domains
   - Add your domain (e.g., calendare.app)

#### Cloudflare Pages Features Used

- **Free Tier**: 100 GB bandwidth/month, unlimited static sites
- **Global CDN**: Fast loading worldwide
- **Automatic HTTPS**: SSL certificates included
- **Custom Domains**: Free custom domain support
- **Build Hooks**: For CI/CD integration (optional)

#### Environment Variables (if needed)

For future enhancements, you can add environment variables:

```bash
wrangler pages secret put API_KEY
```

## Extension Development

### Chrome Extension

- Manifest V3
- Content script for page scanning
- Background service worker for AI processing
- Popup UI for user interaction

### Safari Extension

- Web Extension format compatible with Safari
- Manifest V2 for broader compatibility
- Native macOS integration capabilities

## AI Integration

The extension uses Hugging Face Transformers.js for local event extraction:

- Named Entity Recognition (NER) for extracting event details
- Local processing - no data sent to external servers
- Works offline after initial model download
- Automatic extraction of titles, dates, times, and locations

## Calendar Platform Integration

zro-day supports multiple calendar platforms:

### macOS (Native)

- **Calendar**: iCal file download for import
- **Reminders**: Native host integration with AppleScript

### Google Calendar

- Direct integration via calendar.google.com event creation URLs

### Outlook

- Integration via outlook.live.com calendar compose URLs

### Cross-Platform Support

- Chrome Extension: All platforms supported

## Monetization

- Chrome extension: Free with optional premium features
- Safari extension: Paid on Mac App Store ($4.99 suggested price)

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Extensions**: Chrome Extension API, Safari Web Extensions
- **AI**: OpenAI API
- **Hosting**: Cloudflare Pages
- **Design**: Glassmorphism, CSS Grid, Flexbox
- **Animations**: CSS Animations, Intersection Observer

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please email <support@calendare.app> or visit our website.

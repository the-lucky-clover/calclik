# 🍎 CALCLiK Safari Extension - Complete Development & App Store Guide

## 📋 Table of Contents
1. [Development Setup](#development-setup)
2. [Building the Extension](#building-the-extension)
3. [Local Testing](#local-testing)
4. [App Store Submission](#app-store-submission)
5. [Distribution & Marketing](#distribution--marketing)
6. [Troubleshooting](#troubleshooting)

---

## 🛠 Development Setup

### Prerequisites (Beginner Checklist)
- [ ] **macOS 12.0+** (Monterey or newer)
- [ ] **Xcode 14.0+** (latest version recommended)
- [ ] **Apple Developer Account** ($99/year)
- [ ] **Safari 15.0+** for testing
- [ ] **Command Line Tools** installed

### Step 1: Install Xcode & Tools

```bash
# Install Xcode from Mac App Store (free)
# Then install Command Line Tools
xcode-select --install

# Verify installation
xcode-select -p
```

### Step 2: Apple Developer Account Setup

1. **Visit**: [developer.apple.com](https://developer.apple.com)
2. **Sign up**: Create Apple ID (or use existing)
3. **Enroll**: Pay $99/year for Developer Program
4. **Verify**: Wait for approval (1-2 business days)

### Step 3: Xcode Configuration

```bash
# Open Xcode and sign in
# Xcode → Preferences → Accounts → Add Apple ID
# Enter your Developer Account credentials
```

---

## 🏗 Building the Extension

### Step 1: Create New Project

1. **Open Xcode**
2. **Create New Project** → **macOS** → **Safari Extension App**
3. **Project Settings**:
   ```
   Product Name: CALCLiK Safari
   Team: [Your Developer Team]
   Organization Identifier: com.CALCLiK.safari
   Bundle Identifier: com.CALCLiK.safari
   Language: Swift
   ```

### Step 2: Import CALCLiK Code

1. **Copy Files** from this repository to your Xcode project:
   ```bash
   # Copy the entire safari-web-extension folder
   cp -r safari-web-extension/* [YOUR_XCODE_PROJECT_PATH]/
   ```

2. **Add Files to Xcode**:
   - Drag and drop all Swift files into Xcode
   - Ensure "Copy items if needed" is checked
   - Select "Add to target" for both app and extension

### Step 3: Configure Project Settings

#### Main App Target Settings
```
General Tab:
├── Display Name: CALCLiK - Smart Event Scanner
├── Bundle Identifier: com.CALCLiK.safari
├── Version: 2.0.0
├── Build: 1
├── Minimum Deployments: macOS 12.0
└── App Category: Productivity

Signing & Capabilities:
├── Team: [Your Developer Team]
├── Signing Certificate: Mac App Distribution
└── Provisioning Profile: Automatic
```

#### Safari Extension Target Settings
```
General Tab:
├── Display Name: CALCLiK Safari Extension
├── Bundle Identifier: com.CALCLiK.safari.extension
├── Version: 2.0.0
├── Build: 1
└── Minimum Deployments: macOS 12.0

Signing & Capabilities:
├── Team: [Your Developer Team] 
├── Signing Certificate: Mac App Distribution
└── App Sandbox: ✅ Enabled
    ├── Incoming Connections (Server): ✅
    ├── Outgoing Connections (Client): ✅
    └── User Selected Files (Read/Write): ✅
```

### Step 4: Configure Info.plist Files

#### Main App Info.plist
```xml
<key>NSHumanReadableCopyright</key>
<string>Copyright © 2025 CALCLiK Team. All rights reserved.</string>

<key>LSMinimumSystemVersion</key>
<string>12.0</string>

<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>

<key>LSApplicationCategoryType</key>
<string>public.app-category.productivity</string>
```

#### Safari Extension Info.plist  
```xml
<key>NSExtension</key>
<dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.Safari.extension</string>
    <key>NSExtensionPrincipalClass</key>
    <string>CALCLiKSafariExtension.SafariExtensionHandler</string>
    <key>SFSafariContentScript</key>
    <array>
        <dict>
            <key>Script</key>
            <string>content.js</string>
        </dict>
    </array>
    <key>SFSafariWebsiteAccess</key>
    <dict>
        <key>Level</key>
        <string>All</string>
    </dict>
</dict>
```

---

## 🧪 Local Testing

### Step 1: Build & Run

```bash
# In Xcode
# Select CALCLiK Safari scheme
# Choose "My Mac" as destination
# Press Cmd+R or click "Run"
```

### Step 2: Enable Extension in Safari

1. **Launch Safari**
2. **Safari Menu** → **Preferences** → **Extensions**  
3. **Find CALCLiK** in the list
4. **Enable** the checkbox
5. **Configure permissions** (Allow on all websites)

### Step 3: Test Functionality

#### Basic Testing Checklist
- [ ] Extension icon appears in Safari toolbar
- [ ] Popup opens when clicking icon
- [ ] Page scanning works on test websites
- [ ] Event extraction shows results  
- [ ] Calendar integration buttons work
- [ ] Settings save/load correctly

#### Test Websites
```
Good for testing:
├── eventbrite.com (lots of events)
├── meetup.com (event listings)
├── facebook.com/events (social events)
├── university websites (academic events)
└── conference websites (tech events)
```

### Step 4: Debug Common Issues

```bash
# View console logs
# Safari → Develop → Show Web Inspector
# Check Console tab for JavaScript errors

# View extension logs  
# In Xcode, check debug console for Swift print statements
```

---

## 📱 App Store Submission

### Step 1: Prepare App Store Assets

#### Required Screenshots (5 sizes)
```bash
# Take screenshots at these resolutions:
├── 1280 x 800 (MacBook Air)
├── 1440 x 900 (MacBook Pro 13")  
├── 1680 x 1050 (MacBook Pro 16")
├── 1920 x 1080 (iMac 21.5")
└── 2560 x 1440 (iMac 27")

# Use macOS Screenshot tool: Cmd+Shift+5
# Show CALCLiK in action on each screen size
```

#### App Icon Requirements
```bash
# Create app icons at multiple sizes:
├── 16x16 (Icon-16.png)
├── 32x32 (Icon-32.png)  
├── 64x64 (Icon-64.png)
├── 128x128 (Icon-128.png)
├── 256x256 (Icon-256.png) 
├── 512x512 (Icon-512.png)
└── 1024x1024 (Icon-1024.png)

# Use SF Symbols or custom design
# Must be PNG format, no transparency
```

#### App Store Description
```markdown
CALCLiK - Smart Event Scanner

HEADLINE:
AI-powered event discovery for your calendar. Privacy-first.

DESCRIPTION:
CALCLiK scans any webpage for events and adds them to your calendar instantly. Using advanced AI that runs locally on your Mac, CALCLiK finds events, meetings, and important dates without sending your data anywhere.

KEY FEATURES:
• AI-powered event detection on any website
• Privacy-first: All processing happens locally  
• One-click calendar integration (Google, Outlook, macOS)
• Smart event parsing with dates, times, locations
• Works offline after initial setup
• No registration or API keys required

Perfect for students, professionals, and anyone who wants to stay organized without compromising privacy.

KEYWORDS:
calendar, events, AI, productivity, privacy, Safari, extension, meetings, schedule
```

### Step 2: Archive & Upload

#### Create Archive
```bash
# In Xcode:
# 1. Select "Any Mac" as destination
# 2. Product → Archive
# 3. Wait for build to complete (5-10 minutes)
# 4. Organizer window opens automatically
```

#### Upload to App Store
```bash
# In Xcode Organizer:
# 1. Select your archive
# 2. Click "Distribute App"
# 3. Choose "App Store Connect"
# 4. Upload → Next → Next → Upload
# 5. Wait for processing (30-60 minutes)
```

### Step 3: App Store Connect Configuration

#### Login & Setup
1. **Visit**: [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **My Apps** → **+ (Add new app)**
3. **App Information**:
   ```
   Name: CALCLiK - Smart Event Scanner
   Primary Language: English
   Bundle ID: com.CALCLiK.safari
   SKU: CALCLiK-safari-2025
   ```

#### App Details Page
```
Version Information:
├── Version Number: 2.0.0
├── Copyright: 2025 CALCLiK Team
├── Trade Representative Contact: [Your info]
└── Review Contact: [Your info]

Categories:
├── Primary: Productivity  
└── Secondary: Utilities

Pricing:
├── Price: Free (recommended for launch)
└── Availability: All territories
```

#### Upload Assets
1. **Screenshots**: Upload 5 different sizes
2. **App Icon**: Upload 1024x1024 PNG
3. **App Preview**: Optional promotional video

#### Review Information
```
Contact Information:
├── First Name: [Your name]
├── Last Name: [Your name] 
├── Phone: [Your number]
└── Email: [Your email]

Demo Account (if needed):
├── Username: demo@CALCLiK.com
└── Password: demo123
```

#### Privacy Details
```
Data Collection: None
└── CALCLiK processes all data locally and doesn't collect personal information

Third-party SDKs: None
└── No external analytics or tracking

Content Rights: All rights owned
└── Original software developed by CALCLiK team
```

### Step 4: Submit for Review

1. **Complete all required fields** (red indicators)
2. **Add build** from your uploaded archive
3. **Submit for Review** button
4. **Wait for approval** (1-7 days typically)

---

## 📈 Distribution & Marketing

### Step 1: Launch Strategy

#### Soft Launch Checklist
- [ ] Beta test with 10-20 users
- [ ] Fix any critical bugs found
- [ ] Create support documentation  
- [ ] Set up analytics dashboard
- [ ] Prepare launch announcements

#### Marketing Assets
```bash
# Create marketing materials:
├── Landing page update (CALCLiK.com/safari)
├── Demo video (2-3 minutes)
├── Blog post announcing Safari support
├── Social media graphics  
└── Press kit for tech blogs
```

### Step 2: User Acquisition

#### Free Marketing Channels
```
Organic Discovery:
├── App Store SEO optimization
├── Product Hunt launch
├── Reddit (r/macapps, r/productivity)  
├── Twitter/X announcements
└── Tech blog outreach

Content Marketing:
├── "How to extract events from websites" blog post
├── "Privacy-first browser extensions" article
├── YouTube tutorial videos
└── Newsletter mentions
```

#### Paid Marketing (Optional)
```
App Store Search Ads:
├── Budget: $10-50/day to start
├── Keywords: "calendar app", "event scanner", "productivity"
├── Target: macOS users interested in productivity
└── Monitor cost per download

Google Ads:
├── Target searches for "calendar extension"  
├── Landing page: CALCLiK.com/safari
├── Budget: $20-100/day
└── Track conversion to download
```

### Step 3: User Support

#### Support Channels Setup
```
Documentation:
├── Getting Started guide
├── Troubleshooting FAQ
├── Video tutorials
└── Feature explanations

Contact Methods:
├── Email: support@CALCLiK.com
├── In-app feedback form
├── GitHub issues (for technical users)
└── Twitter/X for quick questions
```

---

## 🛠 Troubleshooting

### Common Development Issues

#### Build Errors
```bash
# "No matching provisioning profiles found"
Solution:
1. Xcode → Preferences → Accounts
2. Download Manual Profiles  
3. Project Settings → Signing → Refresh profiles

# "Code signing entitlements error"
Solution:
1. Check Bundle IDs match exactly
2. Verify App Sandbox is enabled for extension
3. Ensure proper entitlements file
```

#### Extension Not Loading
```bash
# Safari doesn't show extension
Solution:
1. Check minimum macOS version (12.0+)
2. Verify Safari version (15.0+)  
3. Enable Developer mode: Safari → Develop → Allow Unsigned Extensions
4. Rebuild and reinstall extension
```

#### JavaScript Errors
```bash
# Content script not injecting
Solution:  
1. Check manifest.json syntax
2. Verify content script paths
3. Test CSP (Content Security Policy)
4. Use Safari Web Inspector for debugging
```

### App Store Rejection Issues

#### Common Rejections & Fixes
```
"App crashes on launch"
├── Fix: Test on clean macOS install
├── Ensure all dependencies included  
└── Add crash reporting for diagnostics

"Missing functionality"
├── Fix: Clear app description
├── Add comprehensive screenshots
└── Include demo video if needed

"Privacy concerns"  
├── Fix: Update privacy policy
├── Explain local AI processing
└── Remove any external data collection

"Design guidelines violation"
├── Fix: Follow macOS Human Interface Guidelines
├── Use system fonts and spacing
└── Implement proper dark mode support
```

### Performance Optimization

#### Memory Usage
```swift
// Optimize JavaScript memory
- Use WeakRef for DOM references
- Clear large objects after use
- Implement pagination for large result sets
- Cache only essential data
```

#### Battery Life
```swift  
// Reduce CPU usage
- Debounce scroll events  
- Use Intersection Observer efficiently
- Minimize background processing
- Implement smart scanning delays
```

---

## 📞 Support Resources

### Apple Documentation
- [Safari App Extensions](https://developer.apple.com/documentation/safariservices/safari_app_extensions)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [macOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/macos)

### Community Support  
- [Apple Developer Forums](https://developer.apple.com/forums/)
- [Stack Overflow - safari-app-extension](https://stackoverflow.com/questions/tagged/safari-app-extension)
- [Reddit - r/macapps](https://reddit.com/r/macapps)

### CALCLiK Specific
- **Email**: developer@CALCLiK.com
- **Documentation**: CALCLiK.com/docs/safari
- **GitHub**: github.com/CALCLiK/safari-extension

---

## 🎯 Success Metrics

### Key Performance Indicators
```
Technical Metrics:
├── Crash-free rate: >99.5%  
├── Extension load time: <2 seconds
├── Memory usage: <50MB average
└── Battery impact: Minimal

User Metrics:
├── Daily active users: Track growth
├── Event extraction success rate: >85%
├── Calendar integration usage: Track clicks
└── User retention: 7-day and 30-day

Business Metrics:  
├── App Store rating: Target 4.5+ stars
├── Download growth: 10% week-over-week
├── Support ticket volume: <5% of users
└── Revenue (if monetizing): Track conversion
```

---

**🍎 This guide provides everything needed to successfully develop, test, and launch CALCLiK Safari Extension on the Mac App Store!**

*Last Updated: November 10, 2025*  
*Compatible with: macOS 12.0+, Safari 15.0+, Xcode 14.0+*
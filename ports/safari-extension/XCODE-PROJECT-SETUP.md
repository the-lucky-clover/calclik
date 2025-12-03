# CALCLiK Safari Extension - Xcode Project Configuration

## Project Structure
```
CALCLiK Safari.xcodeproj/
├── project.pbxproj (main project file)
└── project.xcworkspace/
    └── contents.xcworkspacedata

CALCLiK Safari/
├── AppDelegate.swift
├── ViewController.swift  
├── Info.plist
├── CALCLiK_Safari.entitlements
└── Assets.xcassets/
    └── AppIcon.appiconset/

CALCLiK Safari Extension/
├── SafariExtensionHandler.swift
├── SafariExtensionViewController.swift
├── Info.plist
├── CALCLiK_Safari_Extension.entitlements
├── content.js
├── background.js
├── popup.html
├── popup.js
└── manifest.json
```

## Xcode Project File Generation

To create the complete Xcode project, follow these steps:

### 1. Create New Project in Xcode
1. Open Xcode
2. Create New Project → macOS → Safari Extension App
3. Configure as specified in SAFARI-DEPLOYMENT-GUIDE.md
4. Replace generated files with CALCLiK files from this directory

### 2. Required Build Settings

#### Main App Target
```
Build Settings:
├── Product Name: CALCLiK Safari
├── Bundle Identifier: com.CALCLiK.safari  
├── Deployment Target: macOS 12.0
├── Development Team: [Your Team ID]
├── Code Signing Style: Automatic
└── Code Signing Identity: Mac App Distribution

Info.plist Settings:
├── Bundle Name: CALCLiK Safari
├── Bundle Display Name: CALCLiK - Smart Event Scanner
├── Bundle Version: 2.0.0
├── Bundle Short Version: 1
├── Minimum System Version: 12.0
└── App Category: Productivity
```

#### Safari Extension Target  
```
Build Settings:
├── Product Name: CALCLiK Safari Extension
├── Bundle Identifier: com.CALCLiK.safari.extension
├── Deployment Target: macOS 12.0  
├── Development Team: [Your Team ID]
├── Code Signing Style: Automatic
└── Code Signing Identity: Mac App Distribution

Extension Settings:
├── Extension Point Identifier: com.apple.Safari.extension
├── Principal Class: CALCLiKSafariExtension.SafariExtensionHandler
├── Content Script: content.js
└── Website Access: All Websites
```

### 3. Entitlements Files

#### CALCLiK_Safari.entitlements
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.network.server</key>
    <true/>
</dict>
</plist>
```

#### CALCLiK_Safari_Extension.entitlements  
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
</dict>
</plist>
```

## Quick Setup Instructions

1. **Create Project**: Use Xcode template as starting point
2. **Replace Files**: Copy all Swift and web files from this directory  
3. **Configure Settings**: Apply build settings above
4. **Test Build**: Cmd+R to build and test locally
5. **Archive**: Product → Archive when ready for App Store

## Asset Requirements

### App Icons (Create with SF Symbols or design tool)
- 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024
- Use green calendar icon to match brand
- PNG format, no transparency

### Screenshots (Required for App Store)  
- 5 different Mac screen sizes
- Show CALCLiK scanning events on real websites
- Include before/after calendar integration

## Next Steps
1. Follow SAFARI-DEPLOYMENT-GUIDE.md for complete walkthrough
2. Test thoroughly before App Store submission  
3. Submit for review once all assets are ready

---

*This file provides the technical foundation for the complete Xcode project setup.*
#!/bin/bash

# Create CalClik Chrome Extension Package
# Run this script to create a distributable ZIP file

echo "📦 Creating CalClik Chrome Extension Package..."

# Create a temporary directory for packaging
TEMP_DIR="calclik-extension-temp"
ZIP_NAME="calclik-chrome-extension.zip"

# Remove existing temp directory and zip file
rm -rf "$TEMP_DIR"
rm -f "$ZIP_NAME"

# Create temp directory
mkdir "$TEMP_DIR"

# Copy extension files
echo "📄 Copying extension files..."
cp chrome-extension/manifest.json "$TEMP_DIR/"
cp chrome-extension/background.js "$TEMP_DIR/"
cp chrome-extension/content.js "$TEMP_DIR/"
cp chrome-extension/popup.html "$TEMP_DIR/"
cp chrome-extension/popup.js "$TEMP_DIR/"

# Create icons directory if it doesn't exist
mkdir -p "$TEMP_DIR/icons"

# Create simple SVG icons if they don't exist
if [ ! -f "chrome-extension/icons/icon16.png" ]; then
    echo "🎨 Creating extension icons..."
    
    # Create a simple SVG icon and convert to PNG (you can replace with actual icons)
    cat > "$TEMP_DIR/icons/icon.svg" << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
    <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00ff88;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#00cc6a;stop-opacity:1" />
        </linearGradient>
    </defs>
    <circle cx="64" cy="64" r="60" fill="url(#grad)" />
    <path d="M45 64 L58 77 L83 52" stroke="white" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
EOF
    
    # Note: In a real scenario, you'd convert SVG to PNG at different sizes
    # For now, we'll just copy the SVG as placeholder
    cp "$TEMP_DIR/icons/icon.svg" "$TEMP_DIR/icons/icon16.png"
    cp "$TEMP_DIR/icons/icon.svg" "$TEMP_DIR/icons/icon48.png"
    cp "$TEMP_DIR/icons/icon.svg" "$TEMP_DIR/icons/icon128.png"
else
    cp chrome-extension/icons/* "$TEMP_DIR/icons/"
fi

# Copy host directory if it exists
if [ -d "chrome-extension/host" ]; then
    echo "📂 Copying native messaging host..."
    cp -r chrome-extension/host "$TEMP_DIR/"
fi

# Create README for users
cat > "$TEMP_DIR/README.txt" << 'EOF'
CalClik - Smart Event Scanner
============================

Installation Instructions:
1. Extract this ZIP file to a folder on your computer
2. Open Chrome and go to chrome://extensions/
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select this folder
5. Click the CalClik icon in your toolbar to start scanning!

For Brave Browser:
- Follow the same steps but go to brave://extensions/

Features:
- 100% local AI processing (no API keys required)
- Privacy-first design
- Works offline after installation
- Supports multiple calendar platforms

Support: Visit calclik.app for more information
EOF

# Create the ZIP file
echo "🗜️  Creating ZIP package..."
cd "$TEMP_DIR" && zip -r "../$ZIP_NAME" . && cd ..

# Clean up temp directory
rm -rf "$TEMP_DIR"

# Move ZIP to landing page directory for download
mv "$ZIP_NAME" "landing-page/$ZIP_NAME"

echo "✅ Extension package created: landing-page/$ZIP_NAME"
echo "📁 Size: $(ls -lh landing-page/$ZIP_NAME | awk '{print $5}')"
echo ""
echo "🚀 Ready for distribution!"
echo "   Users can download from: https://your-domain.com/$ZIP_NAME"
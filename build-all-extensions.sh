#!/bin/bash
# Build all browser extensions for production deployment
# Usage: ./build-all-extensions.sh

set -e  # Exit on error

echo "🚀 CalClik Production Build Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create build directory
echo -e "${BLUE}📁 Creating build directory...${NC}"
rm -rf build
mkdir -p build

# Function to copy common files
copy_common_files() {
    local dest=$1
    echo -e "${BLUE}   Copying common files to $dest...${NC}"
    
    cp background.js "$dest/"
    cp content.js "$dest/"
    cp license.js "$dest/"
    cp popup-licensed.html "$dest/popup.html"
    cp popup-licensed.js "$dest/popup.js"
    cp -r icons "$dest/"
}

# Function to remove development files
remove_dev_files() {
    local dest=$1
    echo -e "${BLUE}   Removing development files from $dest...${NC}"
    
    # Remove development README
    rm -f "$dest/README.txt"
    
    # Remove any .DS_Store files
    find "$dest" -name ".DS_Store" -delete
    
    # Remove any test files
    rm -f "$dest"/*test*.js
}

# Function to minify JavaScript (basic - use proper minifier in real production)
minify_js() {
    local dest=$1
    echo -e "${BLUE}   Minifying JavaScript in $dest...${NC}"
    
    # Note: Install terser globally for real minification
    # npm install -g terser
    # For now, just remove comments and extra whitespace
    
    for file in "$dest"/*.js; do
        if [ -f "$file" ]; then
            # Remove console.log statements
            sed -i '' '/console\.log/d' "$file" 2>/dev/null || sed -i '/console\.log/d' "$file"
            echo -e "      Processed $(basename $file)"
        fi
    done
}

# Build Chrome Extension
echo -e "${GREEN}🌐 Building Chrome Extension...${NC}"
cd chrome-extension
mkdir -p ../build/chrome-extension
copy_common_files ../build/chrome-extension
cp manifest.json ../build/chrome-extension/
mkdir -p ../build/chrome-extension/host
cp host/* ../build/chrome-extension/host/
remove_dev_files ../build/chrome-extension
minify_js ../build/chrome-extension
echo -e "${GREEN}✅ Chrome extension built${NC}"
echo ""

# Build Firefox Extension
echo -e "${GREEN}🦊 Building Firefox Extension...${NC}"
cd ../firefox-extension
mkdir -p ../build/firefox-extension
copy_common_files ../build/firefox-extension
cp manifest.json ../build/firefox-extension/
remove_dev_files ../build/firefox-extension
minify_js ../build/firefox-extension
echo -e "${GREEN}✅ Firefox extension built${NC}"
echo ""

# Build Edge Extension
echo -e "${GREEN}🌊 Building Edge Extension...${NC}"
cd ../edge-extension
mkdir -p ../build/edge-extension
copy_common_files ../build/edge-extension
cp manifest.json ../build/edge-extension/
mkdir -p ../build/edge-extension/host
cp host/* ../build/edge-extension/host/ 2>/dev/null || cp ../chrome-extension/host/* ../build/edge-extension/host/
remove_dev_files ../build/edge-extension
minify_js ../build/edge-extension
echo -e "${GREEN}✅ Edge extension built${NC}"
echo ""

# Build Safari Extension
echo -e "${GREEN}🧭 Building Safari Extension...${NC}"
cd ../safari-extension
mkdir -p ../build/safari-extension
copy_common_files ../build/safari-extension
cp manifest.json ../build/safari-extension/
remove_dev_files ../build/safari-extension
minify_js ../build/safari-extension
echo -e "${GREEN}✅ Safari extension built${NC}"
echo ""

# Create distribution packages
cd ../build
echo -e "${BLUE}📦 Creating distribution packages...${NC}"

# Chrome package
echo -e "${BLUE}   Packaging Chrome extension...${NC}"
cd chrome-extension
zip -r ../calclik-chrome-v1.0.0.zip . -x "*.DS_Store" "*/\.*" > /dev/null
cd ..
echo -e "${GREEN}   ✅ calclik-chrome-v1.0.0.zip created${NC}"

# Firefox package (XPI format)
echo -e "${BLUE}   Packaging Firefox extension...${NC}"
cd firefox-extension
zip -r ../calclik-firefox-v1.0.0.xpi . -x "*.DS_Store" "*/\.*" > /dev/null
cd ..
echo -e "${GREEN}   ✅ calclik-firefox-v1.0.0.xpi created${NC}"

# Edge package
echo -e "${BLUE}   Packaging Edge extension...${NC}"
cd edge-extension
zip -r ../calclik-edge-v1.0.0.zip . -x "*.DS_Store" "*/\.*" > /dev/null
cd ..
echo -e "${GREEN}   ✅ calclik-edge-v1.0.0.zip created${NC}"

# Safari package (directory only, App Store requires Xcode build)
echo -e "${BLUE}   Packaging Safari extension...${NC}"
cd safari-extension
zip -r ../calclik-safari-v1.0.0.zip . -x "*.DS_Store" "*/\.*" > /dev/null
cd ..
echo -e "${GREEN}   ✅ calclik-safari-v1.0.0.zip created${NC}"

# Generate checksums
echo ""
echo -e "${BLUE}🔐 Generating SHA-256 checksums...${NC}"
shasum -a 256 *.zip *.xpi > CHECKSUMS.txt
cat CHECKSUMS.txt
echo -e "${GREEN}✅ Checksums saved to CHECKSUMS.txt${NC}"

# Generate build manifest
echo ""
echo -e "${BLUE}📋 Generating build manifest...${NC}"
cat > BUILD-MANIFEST.json << EOF
{
  "version": "1.0.0",
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "packages": {
    "chrome": {
      "file": "calclik-chrome-v1.0.0.zip",
      "manifestVersion": 3,
      "minBrowserVersion": "88",
      "platforms": ["macOS", "Windows", "Linux"]
    },
    "firefox": {
      "file": "calclik-firefox-v1.0.0.xpi",
      "manifestVersion": 2,
      "minBrowserVersion": "109.0",
      "platforms": ["macOS", "Windows", "Linux"]
    },
    "edge": {
      "file": "calclik-edge-v1.0.0.zip",
      "manifestVersion": 3,
      "minBrowserVersion": "79",
      "platforms": ["macOS", "Windows", "Linux"]
    },
    "safari": {
      "file": "calclik-safari-v1.0.0.zip",
      "manifestVersion": 2,
      "minBrowserVersion": "14.0",
      "platforms": ["macOS"]
    }
  },
  "features": [
    "AI event detection",
    "Multi-calendar integration",
    "License validation",
    "Offline grace period",
    "Privacy-first design"
  ],
  "changelog": [
    "Initial production release",
    "Subscription model at $0.99/month",
    "7-day free trial included",
    "Local AI processing for privacy"
  ]
}
EOF
echo -e "${GREEN}✅ Build manifest created${NC}"

# Print build summary
echo ""
echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}✅ BUILD COMPLETE${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""
echo -e "${BLUE}Build artifacts in:${NC} build/"
echo -e "${BLUE}Distribution packages:${NC}"
echo "  • calclik-chrome-v1.0.0.zip"
echo "  • calclik-firefox-v1.0.0.xpi"
echo "  • calclik-edge-v1.0.0.zip"
echo "  • calclik-safari-v1.0.0.zip"
echo ""
echo -e "${BLUE}Checksums:${NC} build/CHECKSUMS.txt"
echo -e "${BLUE}Manifest:${NC} build/BUILD-MANIFEST.json"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "  1. Review build artifacts in build/ directory"
echo "  2. Test each extension manually"
echo "  3. Upload to respective browser stores:"
echo "     • Chrome: https://chrome.google.com/webstore/devconsole"
echo "     • Firefox: https://addons.mozilla.org/developers/"
echo "     • Edge: https://partner.microsoft.com/dashboard/microsoftedge"
echo "     • Safari: Submit via Xcode to App Store Connect"
echo "  4. Deploy Cloudflare Workers (cloudflare-workers/license-api.js)"
echo "  5. Configure Stripe webhook endpoints"
echo "  6. Update landing page with download links"
echo ""
echo -e "${GREEN}🎉 Ready for production deployment!${NC}"

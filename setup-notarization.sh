#!/bin/bash

# Employee Manager - Notarization Setup Script
set -e

echo "🔐 Employee Manager - Notarization Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo ""
echo "📋 For notarization, you need to provide:"
echo "1. Apple ID (your developer account email)"
echo "2. App-specific password"
echo "3. Team ID (we already know this: YNSZRWFN6S)"
echo ""

# Get Apple ID
read -p "Enter your Apple ID (email): " APPLE_ID
if [ -z "$APPLE_ID" ]; then
    print_error "Apple ID is required"
    exit 1
fi

# Get App-specific password
echo ""
echo "📝 App-specific password setup:"
echo "1. Go to: https://appleid.apple.com/account/manage"
echo "2. Sign in with: $APPLE_ID"
echo "3. Security > App-Specific Passwords"
echo "4. Generate password for 'Employee Manager Notarization'"
echo ""
read -s -p "Enter your app-specific password: " APP_PASSWORD
echo ""

if [ -z "$APP_PASSWORD" ]; then
    print_error "App-specific password is required"
    exit 1
fi

# Set Team ID (we know this from the certificate)
TEAM_ID="YNSZRWFN6S"

# Create .env file for notarization
print_status "Creating .env file with notarization settings..."
cat > .env << EOF
# Apple Developer Notarization Settings
APPLE_ID=$APPLE_ID
APPLE_PASSWORD=$APP_PASSWORD
APPLE_TEAM_ID=$TEAM_ID
EOF

print_success "Created .env file with notarization settings"

# Create notarization script
print_status "Creating notarization script..."
cat > notarize-dmg.sh << 'EOF'
#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

DMG_PATH="employee-manager/src-tauri/target/release/bundle/dmg/Employee Manager_1.0.0_aarch64.dmg"

if [ ! -f "$DMG_PATH" ]; then
    echo "❌ DMG file not found: $DMG_PATH"
    echo "Run 'npm run tauri build' first"
    exit 1
fi

echo "🔐 Starting notarization process..."
echo "📦 DMG: $DMG_PATH"
echo ""

# Submit for notarization
echo "📤 Uploading to Apple for notarization..."
xcrun notarytool submit "$DMG_PATH" \
    --apple-id "$APPLE_ID" \
    --password "$APPLE_PASSWORD" \
    --team-id "$APPLE_TEAM_ID" \
    --wait

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Notarization successful!"
    echo "📎 Stapling notarization to DMG..."
    
    xcrun stapler staple "$DMG_PATH"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 DMG is now fully notarized and ready for distribution!"
        echo "📦 Location: $DMG_PATH"
        echo ""
        echo "✅ This DMG will now:"
        echo "  - Install without warnings on any Mac"
        echo "  - Pass all macOS security checks"
        echo "  - Work for enterprise distribution"
    else
        echo "❌ Failed to staple notarization"
        exit 1
    fi
else
    echo "❌ Notarization failed"
    exit 1
fi
EOF

chmod +x notarize-dmg.sh

print_success "Created notarize-dmg.sh script"

# Create build and notarize script
print_status "Creating combined build and notarize script..."
cat > build-and-notarize.sh << 'EOF'
#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

echo "🔨 Building Employee Manager with Developer ID signing..."
cd employee-manager
npm run tauri build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    cd ..
    echo "🔐 Starting notarization..."
    ./notarize-dmg.sh
else
    echo "❌ Build failed"
    exit 1
fi
EOF

chmod +x build-and-notarize.sh

print_success "Created build-and-notarize.sh script"

echo ""
echo "🎉 Notarization setup complete!"
echo "================================"
echo ""
echo "📋 What was created:"
echo "  ✅ .env file with your credentials"
echo "  ✅ notarize-dmg.sh - notarize existing DMG"
echo "  ✅ build-and-notarize.sh - build and notarize in one step"
echo ""
echo "🚀 Next steps:"
echo "  Option 1: Notarize current DMG:"
echo "    ./notarize-dmg.sh"
echo ""
echo "  Option 2: Build fresh and notarize:"
echo "    ./build-and-notarize.sh"
echo ""
echo "🔒 Security notes:"
echo "  - Your .env file contains sensitive information - keep it secure"
echo "  - Notarization may take 5-15 minutes to complete"
echo "  - The notarized DMG will work on any macOS device without warnings"
echo ""
print_success "Ready to notarize! Run './notarize-dmg.sh' or './build-and-notarize.sh'"


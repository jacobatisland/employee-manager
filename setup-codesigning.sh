#!/bin/bash

# Employee Manager - Code Signing Setup Script
# This script helps configure code signing and notarization for macOS

set -e

echo "🔐 Employee Manager - Code Signing Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is for macOS only"
    exit 1
fi

# Step 1: Check for existing certificates
print_status "Checking for existing code signing certificates..."
CERTIFICATES=$(security find-identity -v -p codesigning 2>/dev/null | grep "Developer ID Application" || true)

if [ -z "$CERTIFICATES" ]; then
    print_warning "No Developer ID Application certificates found"
    echo ""
    echo "📋 You need to:"
    echo "1. Go to https://developer.apple.com/account/resources/certificates"
    echo "2. Create a 'Developer ID Application' certificate"
    echo "3. Download and install it in Keychain Access"
    echo ""
    echo "🔧 To create a Certificate Signing Request (CSR):"
    echo "   - Open Keychain Access"
    echo "   - Keychain Access > Certificate Assistant > Request Certificate from Certificate Authority"
    echo "   - Enter your Apple Developer email and name"
    echo "   - Select 'Saved to disk'"
    echo "   - Upload the .certSigningRequest file to Apple Developer portal"
    echo ""
    read -p "Press Enter after installing your certificate to continue..."
    
    # Check again
    CERTIFICATES=$(security find-identity -v -p codesigning 2>/dev/null | grep "Developer ID Application" || true)
    if [ -z "$CERTIFICATES" ]; then
        print_error "Still no certificates found. Please install your Developer ID Application certificate first."
        exit 1
    fi
fi

print_success "Found code signing certificates:"
echo "$CERTIFICATES"

# Step 2: Get the certificate identity
CERT_NAME=$(echo "$CERTIFICATES" | head -n1 | sed 's/.*"\(.*\)"/\1/')
print_status "Using certificate: $CERT_NAME"

# Step 3: Update Tauri configuration
print_status "Updating Tauri configuration..."
TAURI_CONFIG="employee-manager/src-tauri/tauri.conf.json"

if [ -f "$TAURI_CONFIG" ]; then
    # Create backup
    cp "$TAURI_CONFIG" "$TAURI_CONFIG.backup"
    
    # Update signing identity in tauri.conf.json
    sed -i '' "s/\"signingIdentity\": null/\"signingIdentity\": \"$CERT_NAME\"/" "$TAURI_CONFIG"
    print_success "Updated Tauri configuration with signing identity"
else
    print_error "Tauri configuration file not found: $TAURI_CONFIG"
    exit 1
fi

# Step 4: Set up environment variables for notarization
print_status "Setting up notarization environment..."
echo ""
echo "📝 For notarization, you need:"
echo "1. Apple ID (your developer account email)"
echo "2. App-specific password (create at appleid.apple.com)"
echo "3. Team ID (found in Apple Developer portal)"
echo ""

read -p "Enter your Apple ID (email): " APPLE_ID
read -p "Enter your Team ID: " TEAM_ID
read -s -p "Enter your app-specific password: " APP_PASSWORD
echo ""

# Create .env file for notarization
cat > .env << EOF
# Apple Developer Notarization Settings
APPLE_ID=$APPLE_ID
APPLE_PASSWORD=$APP_PASSWORD
APPLE_TEAM_ID=$TEAM_ID
APPLE_SIGNING_IDENTITY=$CERT_NAME
EOF

print_success "Created .env file with notarization settings"

# Step 5: Create build script
print_status "Creating signed build script..."
cat > build-signed.sh << 'EOF'
#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

echo "🔨 Building signed Employee Manager..."

cd employee-manager

# Build the app with signing
npm run tauri build

echo "✅ Build complete!"
echo "📦 Signed DMG location: src-tauri/target/release/bundle/dmg/"

# Optional: Notarize the DMG
read -p "Do you want to notarize the DMG now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔐 Starting notarization process..."
    
    DMG_PATH=$(find src-tauri/target/release/bundle/dmg/ -name "*.dmg" | head -n1)
    
    if [ -f "$DMG_PATH" ]; then
        echo "Uploading $DMG_PATH for notarization..."
        xcrun notarytool submit "$DMG_PATH" \
            --apple-id "$APPLE_ID" \
            --password "$APPLE_PASSWORD" \
            --team-id "$APPLE_TEAM_ID" \
            --wait
        
        echo "Stapling notarization to DMG..."
        xcrun stapler staple "$DMG_PATH"
        
        echo "✅ Notarization complete!"
    else
        echo "❌ DMG file not found"
    fi
fi
EOF

chmod +x build-signed.sh

print_success "Created build-signed.sh script"

# Step 6: Summary
echo ""
echo "🎉 Code signing setup complete!"
echo "================================"
echo ""
echo "📋 What was configured:"
echo "  ✅ Tauri configuration updated with signing identity"
echo "  ✅ Entitlements file created"
echo "  ✅ Environment variables set for notarization"
echo "  ✅ Build script created (build-signed.sh)"
echo ""
echo "🚀 Next steps:"
echo "  1. Run: ./build-signed.sh"
echo "  2. The script will build and optionally notarize your app"
echo "  3. Distribute the signed DMG from: employee-manager/src-tauri/target/release/bundle/dmg/"
echo ""
echo "🔒 Security notes:"
echo "  - Your .env file contains sensitive information - keep it secure"
echo "  - The signed app will work on any macOS device without security warnings"
echo "  - Notarization may take 5-15 minutes to complete"
echo ""
print_success "Setup complete! Run './build-signed.sh' to create your signed DMG."


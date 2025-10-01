#!/bin/bash

# Employee Management System - Client Build Script
# Builds the Tauri desktop application for distribution

set -e

echo "🏗️  Building Employee Management System Client..."
echo "======================================================"

# Navigate to client directory
cd "$(dirname "$0")/employee-manager"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🔨 Building Tauri application..."
npm run tauri:build

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📱 Built applications can be found in:"
echo "   • Windows: src-tauri/target/release/bundle/msi/"
echo "   • macOS: src-tauri/target/release/bundle/dmg/"
echo ""
echo "🚀 These are standalone executables requiring no dependencies!"
echo "   Ready for distribution to end users."

#!/bin/bash

# Employee Management System - Windows MSI Build Script
# This script builds the Windows MSI installer locally

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔨 Building Employee Management System - Windows MSI${NC}"
echo "========================================================"
echo ""

# Function to print status messages
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're on Windows or have WSL
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || -n "$WSL_DISTRO_NAME" ]]; then
    print_info "Windows environment detected"
else
    print_warning "This script is designed for Windows/WSL. For cross-platform building, use GitHub Actions."
    print_info "To build on macOS/Linux, push to GitHub and use the automated workflow."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js (v18+) first."
    exit 1
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    print_error "Rust is not installed. Please install Rust first."
    print_info "Visit: https://rustup.rs/"
    exit 1
fi

# Check if Tauri CLI is installed
if ! command -v tauri &> /dev/null; then
    print_info "Installing Tauri CLI..."
    npm install -g @tauri-apps/cli
fi

print_status "Prerequisites check passed"

# Navigate to client directory
cd employee-manager

# Install dependencies
print_info "Installing frontend dependencies..."
npm ci

print_status "Dependencies installed"

# Build frontend
print_info "Building frontend..."
npm run build

print_status "Frontend built successfully"

# Add Windows target
print_info "Adding Windows target..."
rustup target add x86_64-pc-windows-msvc

# Build Tauri app for Windows
print_info "Building Tauri app for Windows..."
npm run tauri build -- --target x86_64-pc-windows-msvc

print_status "Tauri app built successfully"

# Check if MSI was created
MSI_PATH="src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msi"
if [ -d "$MSI_PATH" ]; then
    MSI_FILE=$(find "$MSI_PATH" -name "*.msi" | head -1)
    if [ -n "$MSI_FILE" ]; then
        print_status "MSI installer created successfully!"
        echo ""
        echo -e "${BLUE}📦 MSI Installer Details:${NC}"
        echo "  File: $(basename "$MSI_FILE")"
        echo "  Path: $MSI_FILE"
        echo "  Size: $(du -h "$MSI_FILE" | cut -f1)"
        echo ""
        echo -e "${YELLOW}🚀 Installation Instructions:${NC}"
        echo "  1. Run the MSI file as Administrator"
        echo "  2. Follow the installation wizard"
        echo "  3. Launch from Start Menu or Desktop shortcut"
        echo ""
        echo -e "${GREEN}✅ Windows MSI build completed successfully!${NC}"
    else
        print_error "MSI file not found in $MSI_PATH"
        exit 1
    fi
else
    print_error "MSI directory not found: $MSI_PATH"
    exit 1
fi

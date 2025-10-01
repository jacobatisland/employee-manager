#!/bin/bash

# GitHub Actions Setup Script for Employee Manager
# This script helps you set up GitHub Actions for automatic MSI building

set -e

echo "🚀 GitHub Actions Setup for Employee Manager"
echo "=============================================="
echo ""

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

# Check if we're in the right directory
if [ ! -f "employee-manager/package.json" ]; then
    print_error "Please run this script from the DemoApp root directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
    print_success "Git repository initialized"
else
    print_success "Git repository already exists"
fi

# Check if GitHub remote exists
if git remote get-url origin >/dev/null 2>&1; then
    print_success "GitHub remote already configured"
    GITHUB_URL=$(git remote get-url origin)
    echo "  Remote URL: $GITHUB_URL"
else
    print_warning "No GitHub remote configured"
    echo ""
    echo "Please provide your GitHub repository URL:"
    echo "Example: https://github.com/yourusername/employee-manager.git"
    read -p "GitHub URL: " GITHUB_URL
    
    if [ -n "$GITHUB_URL" ]; then
        git remote add origin "$GITHUB_URL"
        print_success "GitHub remote added: $GITHUB_URL"
    else
        print_warning "No URL provided. You'll need to add it manually later:"
        echo "  git remote add origin https://github.com/yourusername/employee-manager.git"
    fi
fi

# Check if workflow files exist
if [ -f ".github/workflows/build.yml" ] && [ -f ".github/workflows/windows-only.yml" ]; then
    print_success "GitHub Actions workflow files already exist"
else
    print_status "Creating GitHub Actions workflow files..."
    
    # Create .github/workflows directory
    mkdir -p .github/workflows
    
    print_success "GitHub Actions workflows created"
fi

# Check if all required files exist
print_status "Checking required files..."

REQUIRED_FILES=(
    "employee-manager/package.json"
    "employee-manager/src-tauri/tauri.conf.json"
    "deploy-windows-client.ps1"
    "deploy-windows-client.bat"
    "WINDOWS_DEPLOYMENT.md"
    "WINDOWS_QUICK_START.md"
    ".github/workflows/build.yml"
    ".github/workflows/windows-only.yml"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file"
    else
        print_error "✗ $file (missing)"
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    print_error "Some required files are missing. Please ensure all files are present before proceeding."
    exit 1
fi

# Check git status
print_status "Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes:"
    git status --short
    
    echo ""
    read -p "Do you want to commit these changes? (y/N): " COMMIT_CHANGES
    
    if [[ $COMMIT_CHANGES =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Add GitHub Actions workflows and Windows deployment support"
        print_success "Changes committed"
    else
        print_warning "Changes not committed. You may want to commit them before pushing."
    fi
else
    print_success "Working directory is clean"
fi

# Check if we can push to GitHub
if git remote get-url origin >/dev/null 2>&1; then
    print_status "Testing GitHub connection..."
    
    # Check if we can fetch from origin
    if git fetch origin >/dev/null 2>&1; then
        print_success "GitHub connection successful"
        
        # Check if we need to push
        LOCAL_COMMITS=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
        if [ "$LOCAL_COMMITS" -gt 0 ]; then
            print_status "You have $LOCAL_COMMITS local commits to push"
            read -p "Do you want to push to GitHub now? (y/N): " PUSH_NOW
            
            if [[ $PUSH_NOW =~ ^[Yy]$ ]]; then
                git push origin main
                print_success "Code pushed to GitHub"
                print_success "GitHub Actions should now be triggered automatically!"
            else
                print_warning "Not pushed. You can push later with: git push origin main"
            fi
        else
            print_success "Local repository is up to date with GitHub"
        fi
    else
        print_error "Cannot connect to GitHub. Please check your repository URL and permissions."
        exit 1
    fi
else
    print_warning "No GitHub remote configured. You'll need to:"
    echo "  1. Create a GitHub repository"
    echo "  2. Add the remote: git remote add origin https://github.com/yourusername/employee-manager.git"
    echo "  3. Push your code: git push -u origin main"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Click the 'Actions' tab"
echo "3. Watch the workflow run"
echo "4. Download the MSI from 'Releases' when ready"
echo ""
echo "For detailed instructions, see: GITHUB_ACTIONS_SETUP.md"
echo ""
echo "Happy building! 🚀"

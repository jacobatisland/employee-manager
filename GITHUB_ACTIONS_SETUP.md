# GitHub Actions Setup Guide

## 🚀 **Complete Walkthrough: Building MSI with GitHub Actions**

This guide walks you through setting up GitHub Actions to automatically build Windows MSI installers from your macOS development environment.

## 📋 **Prerequisites**

### **1. GitHub Repository**
- Your code must be in a GitHub repository
- Repository must be public (for free GitHub Actions) or have GitHub Pro/Team (for private repos)

### **2. Required Files**
- ✅ `employee-manager/` - Your Tauri project
- ✅ `deploy-windows-client.ps1` - PowerShell deployment script
- ✅ `deploy-windows-client.bat` - Batch deployment script
- ✅ `WINDOWS_DEPLOYMENT.md` - Windows deployment documentation
- ✅ `.github/workflows/` - GitHub Actions workflows (we'll create these)

## 🔧 **Step-by-Step Setup**

### **Step 1: Initialize Git Repository (if not already done)**

```bash
# Navigate to your project
cd /Users/jacobmatthews/Documents/DemoApp

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Employee Management System"

# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/employee-manager.git

# Push to GitHub
git push -u origin main
```

### **Step 2: Create GitHub Repository**

1. **Go to GitHub.com** and sign in
2. **Click "New Repository"**
3. **Repository Settings**:
   - **Name**: `employee-manager` (or your preferred name)
   - **Description**: "Employee Management System for VPN/ZTNA Demo"
   - **Visibility**: Public (for free GitHub Actions)
   - **Initialize**: Don't check any boxes (we'll push existing code)

### **Step 3: Push Your Code**

```bash
# Push your code to GitHub
git push origin main
```

### **Step 4: Verify Workflow Files**

The workflow files should now be in your repository:
- `.github/workflows/build.yml` - Multi-platform builds
- `.github/workflows/windows-only.yml` - Windows-specific builds

## 🎯 **Workflow Options**

### **Option A: Windows-Only Build (Recommended for MSI)**

**File**: `.github/workflows/windows-only.yml`

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual trigger with custom server URL

**Features**:
- ✅ Builds Windows MSI installer
- ✅ Tests MSI installation/uninstallation
- ✅ Creates GitHub Release with MSI
- ✅ Uploads deployment scripts
- ✅ Configurable server URL

### **Option B: Multi-Platform Build**

**File**: `.github/workflows/build.yml`

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Tags (for releases)
- Manual trigger

**Features**:
- ✅ Builds for Windows, macOS, and Linux
- ✅ Creates GitHub Release with all platforms
- ✅ Matrix strategy for parallel builds

## 🚀 **How to Use**

### **Method 1: Automatic Build (Recommended)**

1. **Push code to trigger build**:
   ```bash
   git add .
   git commit -m "Add Windows deployment support"
   git push origin main
   ```

2. **Monitor the build**:
   - Go to your GitHub repository
   - Click "Actions" tab
   - Watch the workflow run

3. **Download MSI**:
   - Go to "Releases" in your repository
   - Download the latest MSI file

### **Method 2: Manual Build**

1. **Go to GitHub Actions**:
   - Navigate to your repository
   - Click "Actions" tab
   - Select "Windows MSI Build" workflow

2. **Trigger manually**:
   - Click "Run workflow"
   - Enter server URL (optional)
   - Click "Run workflow"

### **Method 3: Tag-Based Release**

1. **Create a release tag**:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. **GitHub Actions will automatically**:
   - Build the MSI
   - Create a GitHub Release
   - Upload the MSI file

## 📦 **What Gets Built**

### **Windows MSI Output**
```
employee-manager/src-tauri/target/release/bundle/msi/
└── Employee Manager_1.0.0_x64_en-US.msi
```

### **GitHub Release Includes**
- **MSI Installer**: `Employee Manager_1.0.0_x64_en-US.msi`
- **Deployment Scripts**: PowerShell and Batch files
- **Documentation**: Windows deployment guides
- **Release Notes**: Automatic changelog

## 🔍 **Monitoring Builds**

### **View Build Status**
1. Go to your GitHub repository
2. Click "Actions" tab
3. Click on the workflow run
4. Click on individual jobs to see logs

### **Build Logs**
- **Frontend Build**: Node.js and Vite build process
- **Rust Build**: Tauri compilation
- **MSI Creation**: Windows installer generation
- **Testing**: MSI installation/uninstallation tests

### **Common Issues**

#### **Build Fails - Frontend**
```yaml
# Check Node.js version in workflow
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'  # Ensure this matches your local version
```

#### **Build Fails - Rust**
```yaml
# Check Rust toolchain
- name: Setup Rust
  uses: dtolnay/rust-toolchain@stable
  with:
    targets: x86_64-pc-windows-msvc
```

#### **MSI Creation Fails**
- Check Tauri configuration
- Verify icon files exist
- Ensure all dependencies are installed

## 🎛️ **Customization**

### **Custom Server URL**
```yaml
# In workflow_dispatch inputs
inputs:
  server_url:
    description: 'Default server URL for MSI'
    required: false
    default: 'https://your-server.com:3001'
    type: string
```

### **Build Matrix**
```yaml
# Add more Windows versions
strategy:
  matrix:
    include:
      - platform: 'windows-2019'
        args: ''
        bundle: 'msi'
      - platform: 'windows-2022'
        args: ''
        bundle: 'msi'
```

### **Release Configuration**
```yaml
# Customize release settings
with:
  tagName: windows-v__VERSION__
  releaseName: 'Employee Manager Windows v__VERSION__'
  releaseDraft: true
  prerelease: false
```

## 📊 **Build Artifacts**

### **Automatic Artifacts**
- **MSI File**: Windows installer
- **Deployment Scripts**: PowerShell and Batch files
- **Documentation**: Windows deployment guides
- **Build Logs**: Detailed build information

### **Retention**
- **MSI Files**: 90 days
- **Deployment Scripts**: 90 days
- **Build Logs**: 30 days

## 🔐 **Security Considerations**

### **Secrets Management**
```yaml
# Use GitHub Secrets for sensitive data
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  SERVER_URL: ${{ secrets.SERVER_URL }}
```

### **Code Signing (Optional)**
```yaml
# Add code signing for production
- name: Sign MSI
  run: |
    signtool sign /f certificate.pfx /p ${{ secrets.CERT_PASSWORD }} /t http://timestamp.digicert.com "Employee Manager_1.0.0_x64_en-US.msi"
```

## 🎯 **Next Steps After Setup**

### **1. Test the Build**
```bash
# Make a small change and push
echo "# Test build" >> README.md
git add README.md
git commit -m "Test GitHub Actions build"
git push origin main
```

### **2. Download MSI**
1. Go to GitHub Releases
2. Download the latest MSI
3. Test installation on Windows

### **3. Set Up Notifications**
- Enable GitHub notifications for build failures
- Set up email alerts for successful releases
- Configure Slack/Discord integration (optional)

## 📞 **Troubleshooting**

### **Common Issues**

#### **"Workflow not found"**
- Ensure `.github/workflows/` directory exists
- Check YAML syntax is valid
- Verify file is committed and pushed

#### **"Permission denied"**
- Check repository permissions
- Ensure GITHUB_TOKEN has necessary permissions
- Verify workflow file is in correct location

#### **"Build fails"**
- Check build logs for specific errors
- Verify all dependencies are installed
- Test locally first

### **Debug Commands**
```bash
# Check workflow syntax
yamllint .github/workflows/*.yml

# Test locally (if possible)
npm run tauri build --target x86_64-pc-windows-msvc
```

## 🎉 **Success!**

Once set up, you'll have:
- ✅ **Automatic MSI builds** on every push
- ✅ **GitHub Releases** with downloadable MSIs
- ✅ **Deployment scripts** ready to use
- ✅ **Multi-platform support** (if using full workflow)
- ✅ **Professional CI/CD pipeline**

**Your MSI files will be automatically built and available in GitHub Releases!** 🚀

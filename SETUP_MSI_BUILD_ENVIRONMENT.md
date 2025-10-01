# Setting Up MSI Build Environment for Employee Manager

## Overview
To build MSI installers for the Employee Manager application on Windows, you need to set up the development environment with the required tools.

## Prerequisites

### 1. Node.js ✅
- **Status**: Already installed at `C:\Program Files\nodejs`
- **Version**: v24.9.0
- **Action Required**: Add to PATH if not already done

### 2. Rust ❌
- **Status**: Not installed or not in PATH
- **Required**: Yes (for Tauri application building)
- **Action Required**: Install Rust

### 3. Visual Studio Build Tools
- **Status**: Unknown
- **Required**: Yes (for Windows MSI building)
- **Action Required**: Verify installation

## Installation Steps

### Step 1: Install Rust

#### Option A: Using rustup (Recommended)
1. Download rustup from: https://rustup.rs/
2. Run the installer: `rustup-init.exe`
3. Follow the installation prompts
4. Restart your terminal/PowerShell
5. Verify installation: `rustc --version`

#### Option B: Using PowerShell
```powershell
# Download and install rustup
Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "rustup-init.exe"
.\rustup-init.exe
```

### Step 2: Install Visual Studio Build Tools

#### Option A: Visual Studio Installer
1. Download Visual Studio Installer
2. Install "Build Tools for Visual Studio 2022"
3. Select workload: "C++ build tools"
4. Include: "Windows 10/11 SDK"

#### Option B: Using chocolatey (if available)
```powershell
choco install visualstudio2022buildtools
```

### Step 3: Install Tauri Prerequisites

```powershell
# Install required Windows features
rustup target add x86_64-pc-windows-msvc

# Install Tauri CLI globally
npm install -g @tauri-apps/cli

# Verify installation
npx tauri --version
```

### Step 4: Configure Environment

Add to your PowerShell profile or set permanently:
```powershell
# Add Node.js to PATH
$env:PATH += ";C:\Program Files\nodejs"

# Add Rust to PATH (usually automatic after installation)
$env:PATH += ";$env:USERPROFILE\.cargo\bin"

# Verify both are working
node --version
rustc --version
```

## Building the MSI Installer

Once all prerequisites are installed, use the provided build script:

### Quick Build
```powershell
# Set PATH for current session
$env:PATH += ";C:\Program Files\nodejs"
$env:PATH += ";$env:USERPROFILE\.cargo\bin"

# Run the MSI builder
.\build-msi-basic.ps1
```

### Custom Build
```powershell
# Build to specific output directory
.\build-msi-basic.ps1 -OutputPath "C:\Builds\EmployeeManager"
```

## Expected Output

After successful build, you should see:
- `Employee Manager_1.0.0_x64_en-US.msi` - Windows MSI installer
- `employee-manager.exe` - Standalone executable
- `deploy-windows-client.ps1` - PowerShell deployment script
- `deploy-windows-client.bat` - Batch deployment script

## Troubleshooting

### Common Issues

#### 1. "rustc not found"
- Ensure Rust is installed: `rustup --version`
- Check PATH includes cargo bin: `echo $env:PATH`
- Restart PowerShell after Rust installation

#### 2. "linker not found"
- Install Visual Studio Build Tools
- Ensure C++ build tools are selected
- May need to install Windows SDK

#### 3. "MSI build failed"
- Check Tauri configuration in `src-tauri/tauri.conf.json`
- Ensure all dependencies are installed: `npm install`
- Try building in debug mode first: `npm run tauri:build:debug`

#### 4. "Permission denied"
- Run PowerShell as Administrator
- Check antivirus software isn't blocking the build
- Ensure output directory is writable

### Environment Verification

Use this script to verify your environment:

```powershell
# Environment Check Script
Write-Host "Environment Verification" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

# Check Node.js
try {
    $nodeVersion = & node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js: Not found" -ForegroundColor Red
}

# Check Rust
try {
    $rustVersion = & rustc --version
    Write-Host "✓ Rust: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Rust: Not found" -ForegroundColor Red
}

# Check Cargo
try {
    $cargoVersion = & cargo --version
    Write-Host "✓ Cargo: $cargoVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Cargo: Not found" -ForegroundColor Red
}

# Check Tauri CLI
try {
    $tauriVersion = & npx tauri --version
    Write-Host "✓ Tauri CLI: $tauriVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Tauri CLI: Not found" -ForegroundColor Red
}

# Check MSBuild
try {
    $msbuildPath = & where msbuild 2>$null
    if ($msbuildPath) {
        Write-Host "✓ MSBuild: Found" -ForegroundColor Green
    } else {
        Write-Host "⚠ MSBuild: Not in PATH" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ MSBuild: Not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "If all items show ✓, you're ready to build MSI installers!" -ForegroundColor Green
```

## Next Steps

1. **Install missing prerequisites** (mainly Rust and build tools)
2. **Run environment verification script**
3. **Execute MSI build script**
4. **Test the generated MSI installer**
5. **Deploy using provided deployment scripts**

## Alternative: Use Existing Builds

If you prefer not to set up the build environment, you can:
1. Use the existing macOS builds for Mac deployment
2. Set up a CI/CD pipeline (GitHub Actions) to build Windows MSI
3. Use a Windows build machine/VM with the environment pre-configured

## CI/CD Option (GitHub Actions)

For automated MSI building, consider setting up GitHub Actions:
- Windows runner with Rust and Node.js pre-installed
- Automatic MSI generation on code pushes
- Artifact storage for easy download

See `GITHUB_ACTIONS_SETUP.md` for more details on CI/CD setup.

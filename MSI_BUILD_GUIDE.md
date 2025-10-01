# Complete MSI Installer Build Guide

## ✅ What's Already Done

1. **Rust Installed** - Rust 1.90.0 is installed and ready
2. **Enhanced Tauri Configuration** - MSI metadata configured in `tauri.conf.json`
3. **VS Build Tools Downloaded** - Installer is ready at: `%TEMP%\vs_buildtools.exe`
4. **Build Scripts Created** - Multiple PowerShell build scripts available

## 📋 Current Status

- ✅ Rust 1.90.0 installed
- ✅ Node.js v24.9.0 installed
- ⏳ Visual Studio Build Tools - **Ready to Install**
- ⏳ MSI Build - **Waiting for Build Tools**

---

## 🚀 Next Steps to Complete MSI Installer

### Step 1: Install Visual Studio Build Tools (Required)

The installer has been downloaded. You need to run it with administrator privileges:

#### Option A: Run from Windows Explorer
1. Press `Win + R`
2. Type: `%TEMP%`
3. Find and double-click: `vs_buildtools.exe`
4. When prompted, **Run as Administrator**
5. In the installer:
   - Select **"Desktop development with C++"**
   - Or at minimum, select:
     - "MSVC v143 - VS 2022 C++ x64/x86 build tools"
     - "Windows 11 SDK"
6. Click **Install** (this will take 5-15 minutes)
7. **Restart your terminal** after installation

#### Option B: Run via PowerShell (Administrator)
```powershell
# Open PowerShell as Administrator, then run:
Start-Process "$env:TEMP\vs_buildtools.exe" -ArgumentList "--quiet","--wait","--add","Microsoft.VisualStudio.Workload.VCTools" -Wait
```

### Step 2: Build the MSI Installer

After installing Visual Studio Build Tools and restarting your terminal:

```powershell
# Navigate to project directory
cd Z:\Documents\DemoApp\employee-manager

# Build the Tauri application with MSI bundler
npm run tauri:build

# Or use the build script:
cd ..
powershell -ExecutionPolicy Bypass -File .\build-msi-basic.ps1
```

### Step 3: Find Your MSI Installer

After a successful build, your MSI installer will be located at:

```
employee-manager/src-tauri/target/release/bundle/msi/Employee Manager_1.0.0_x64_en-US.msi
```

---

## 🛠️ Alternative: Use Existing Bundle

I noticed you already have a built DMG bundle for macOS. If you need an MSI immediately and Visual Studio Build Tools installation is taking too long, you have options:

### Option 1: Use NSIS Installer Instead
NSIS requires fewer dependencies than MSI:

```json
// In tauri.conf.json, change targets to:
"targets": ["nsis"]
```

Then build:
```powershell
npm run tauri:build
```

### Option 2: Create a Portable Executable
Build without any bundler (creates a standalone .exe):

```powershell
cd employee-manager
npm run tauri:build -- --target x86_64-pc-windows-msvc --no-bundle
```

---

## 📦 Build Scripts Available

1. **`build-msi-basic.ps1`** - Simple, reliable MSI build script
2. **`build-msi-simple.ps1`** - Alternative simplified version
3. **`build-msi.ps1`** - Advanced build script with full features
4. **`setup-msi-environment.ps1`** - Complete environment setup orchestrator
5. **`install-vs-buildtools.ps1`** - Automated VS Build Tools installer

---

## ⚙️ System Requirements for MSI Building

### Required:
- ✅ Windows 10/11
- ✅ Node.js 14+ (you have v24.9.0)
- ✅ Rust 1.70+ (you have 1.90.0)
- ⏳ Visual Studio Build Tools with C++ workload

### Disk Space:
- VS Build Tools: ~6-8 GB
- Tauri Build: ~2-3 GB

---

## 🔧 Troubleshooting

### Issue: "link.exe not found" during build
**Solution**: Install Visual Studio Build Tools (Step 1 above)

### Issue: Build takes a long time
**Normal**: First build takes 10-20 minutes due to Rust compilation

### Issue: MSI not created, only .exe
**Solution**: Ensure WiX Toolset components are installed (part of VS Build Tools)

### Issue: Permission denied errors
**Solution**: Run PowerShell as Administrator

---

## 📝 Quick Command Reference

```powershell
# Check if VS Build Tools are installed
Get-Command cl.exe -ErrorAction SilentlyContinue

# Install VS Build Tools (if not installed)
Start-Process "$env:TEMP\vs_buildtools.exe" -Wait

# Build MSI (after VS Build Tools installed)
cd employee-manager
npm run tauri:build

# Check build output
dir src-tauri\target\release\bundle\msi\
```

---

## 📞 Support

If you encounter issues:

1. Check the build log for specific errors
2. Ensure all prerequisites are installed
3. Try rebuilding after restarting your terminal
4. Verify Rust toolchain: `rustc --version`
5. Verify Node.js: `node --version`
6. Verify cargo: `cargo --version`

---

## 🎯 Expected Output

After successful build, you'll have:

```
employee-manager/src-tauri/target/release/bundle/msi/
├── Employee Manager_1.0.0_x64_en-US.msi  (Main installer)
└── installer-metadata.json                (Build metadata)
```

The MSI installer will:
- Install to `C:\Program Files\Employee Manager\`
- Create Start Menu shortcuts
- Support silent installation: `msiexec /i "Employee Manager_1.0.0_x64_en-US.msi" /quiet`
- Support uninstallation via Windows Settings

---

## ✨ Once Built

Your MSI installer will be production-ready with:
- ✅ Professional metadata (company name, copyright, etc.)
- ✅ Start Menu integration
- ✅ Add/Remove Programs support
- ✅ Silent installation capability
- ✅ Automatic updates support
- ✅ Digital signature ready (if you have a cert)

---

**Ready to proceed?** Run Step 1 above to install Visual Studio Build Tools!


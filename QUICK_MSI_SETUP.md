# Quick MSI Setup Instructions

## Current Status

✅ **Rust 1.90.0** - Installed
✅ **Node.js v24.9.0** - Installed  
✅ **Tauri Configuration** - Enhanced with MSI metadata
⏳ **Tauri CLI** - Installing in background (check with: `cargo tauri --version`)
❌ **Visual Studio Build Tools** - Not installed (required for MSI)

---

## Simple 3-Step Process

### Step 1: Install Visual Studio Build Tools (5-15 minutes)

The installer is already downloaded. In **THIS window** (not Administrator), run:

```powershell
Start-Process "$env:TEMP\vs_buildtools.exe" -ArgumentList "--add","Microsoft.VisualStudio.Workload.VCTools","--add","Microsoft.VisualStudio.Component.Windows11SDK.22000" -Wait
```

**OR** manually:
1. Press `Win + R`
2. Type: `%TEMP%`
3. Double-click: `vs_buildtools.exe`
4. Select: "Desktop development with C++"
5. Click Install

### Step 2: Wait for Tauri CLI (if not ready)

Check if ready:
```powershell
cargo tauri --version
```

If it says "no such command", wait a few more minutes and try again.

### Step 3: Build the MSI

Once both are ready, run:

```powershell
cd employee-manager
cargo tauri build
```

This will take 10-20 minutes and create your MSI at:
```
src-tauri/target/release/bundle/msi/Employee Manager_1.0.0_x64_en-US.msi
```

---

## Alternative: Use the Build Script

After Step 1 completes, you can use the simpler build script:

```powershell
cd employee-manager
npm install @tauri-apps/cli@latest --save-dev
npx tauri build
```

---

## Troubleshooting

### "cargo tauri: no such command"
- Tauri CLI is still installing in background
- Wait 5-10 more minutes
- Check: `cargo install --list | Select-String tauri`

### "link.exe not found" 
- Visual Studio Build Tools not installed or not in PATH
- Restart your terminal after VS Build Tools installation
- Re-run the build command

### Build takes forever
- First build is slow (10-20 min) - this is normal
- Compiling Rust dependencies for the first time
- Subsequent builds will be much faster

---

## What You'll Get

Your MSI installer will include:
- ✅ Professional Windows installer
- ✅ Start Menu shortcuts
- ✅ Add/Remove Programs integration
- ✅ Silent installation support (`msiexec /i "filename.msi" /quiet`)
- ✅ Automatic uninstaller
- ✅ All metadata (company, copyright, version)

---

## Need Help?

See the comprehensive guide: `MSI_BUILD_GUIDE.md`

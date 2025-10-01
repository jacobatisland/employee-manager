# Windows 11 Client - Quick Start Guide

## 🚀 Quick Deployment (5 minutes)

### Prerequisites
- Windows 11 (64-bit)
- Administrator privileges
- Network access to server

### Method 1: Automated PowerShell Script
```powershell
# Download and run the deployment script
.\deploy-windows-client.ps1 -ServerUrl "https://your-server.com:3001"
```

### Method 2: Automated Batch Script
```cmd
# Run as Administrator
deploy-windows-client.bat https://your-server.com:3001
```

### Method 3: Manual Installation
1. **Download**: Get `Employee Manager_1.0.0_x64_en-US.msi`
2. **Install**: Double-click MSI file
3. **Configure**: Launch app → Settings → Enter server URL
4. **Test**: Click "Test Connection" → "Apply Settings"

## ⚙️ Configuration

### Server Settings
- **URL**: `https://your-server.com:3001`
- **Timeout**: 30 seconds
- **Auto-reconnect**: Enabled
- **SSL Verification**: Enabled

### Client Settings
- **Auto-refresh**: 5 minutes
- **Default view**: Employees
- **Items per page**: 25

## 🔧 Troubleshooting

### Connection Issues
```powershell
# Test server connectivity
Test-NetConnection -ComputerName "your-server.com" -Port 3001

# Check if app is running
Get-Process "Employee Manager" -ErrorAction SilentlyContinue
```

### Common Solutions
1. **"Connection Failed"** → Check server URL and network
2. **"SSL Error"** → Verify server certificate
3. **"App Won't Start"** → Run as Administrator
4. **"Slow Performance"** → Close other apps, check network

## 📁 File Locations

### Installation
- **App**: `C:\Program Files\Employee Manager\`
- **Config**: `%APPDATA%\Employee Manager\`
- **Logs**: `%APPDATA%\Employee Manager\logs\`

### Shortcuts
- **Desktop**: `%USERPROFILE%\Desktop\Employee Manager.lnk`
- **Start Menu**: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Employee Manager.lnk`

## 🛡️ Security

### Firewall Rules
- **Inbound**: Allow Employee Manager.exe
- **Outbound**: Allow Employee Manager.exe
- **Ports**: 3001 (HTTPS) to server

### Best Practices
- Use HTTPS for server connection
- Keep application updated
- Run with minimal privileges
- Enable Windows Defender

## 📞 Support

### Log Files
- **Installation**: `%TEMP%\EmployeeManager_Install_*.log`
- **Application**: `%APPDATA%\Employee Manager\logs\app.log`
- **Windows Events**: Event Viewer → Application

### Quick Commands
```powershell
# View recent logs
Get-Content "$env:APPDATA\Employee Manager\logs\app.log" -Tail 20

# Check Windows events
Get-WinEvent -LogName "Application" -MaxEvents 10 | Where-Object {$_.Message -like "*Employee Manager*"}

# Uninstall (if needed)
msiexec /x "Employee Manager_1.0.0_x64_en-US.msi" /quiet
```

## ✅ Verification Checklist

- [ ] Application installed successfully
- [ ] Desktop shortcut created
- [ ] Start Menu shortcut created
- [ ] Server connection tested
- [ ] Firewall rules configured
- [ ] Configuration file created
- [ ] Application launches without errors
- [ ] Data loads from server
- [ ] All features working

## 🎯 Next Steps

1. **Launch** the application
2. **Verify** server connection
3. **Test** all features
4. **Configure** user preferences
5. **Train** end users

---

**Need Help?** Check the full documentation in `WINDOWS_DEPLOYMENT.md`

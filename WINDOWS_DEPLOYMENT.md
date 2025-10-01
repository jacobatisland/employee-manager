# Windows 11 Client Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Employee Management System client on Windows 11, assuming the server is already deployed elsewhere.

## Prerequisites

### System Requirements
- **Operating System**: Windows 11 (64-bit)
- **Architecture**: x64 or ARM64
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: 100MB free space
- **Network**: Internet connection for initial setup

### Server Requirements
- **Server URL**: Must be accessible from the Windows client
- **HTTPS**: Recommended for production deployments
- **CORS**: Server must allow connections from the client
- **API Endpoints**: All required endpoints must be available

## Deployment Methods

### Method 1: Direct Installation (Recommended)

#### Step 1: Download the Application
1. Obtain the Windows installer from the build output:
   - **MSI Installer**: `src-tauri/target/release/bundle/msi/Employee Manager_1.0.0_x64_en-US.msi`
   - **Portable Executable**: `src-tauri/target/release/employee-manager.exe`

#### Step 2: Install the Application

**Option A: MSI Installer (Recommended)**
```powershell
# Run as Administrator
msiexec /i "Employee Manager_1.0.0_x64_en-US.msi" /quiet
```

**Option B: Manual Installation**
1. Double-click the MSI file
2. Follow the installation wizard
3. Choose installation directory (default: `C:\Program Files\Employee Manager\`)
4. Complete the installation

**Option C: Portable Version**
1. Extract the executable to desired location
2. No installation required - run directly

#### Step 3: Configure Server Connection
1. Launch the Employee Manager application
2. Navigate to **Settings** in the sidebar
3. In the **Server Configuration** section:
   - Enter the server URL (e.g., `https://your-server.com:3001`)
   - Click **Test Connection** to verify connectivity
   - Click **Apply Settings** to save

### Method 2: Enterprise Deployment

#### Group Policy Deployment
1. **Prepare MSI Package**:
   ```powershell
   # Copy MSI to network share
   copy "Employee Manager_1.0.0_x64_en-US.msi" "\\domain\software\EmployeeManager\"
   ```

2. **Create Group Policy Object**:
   - Open Group Policy Management Console
   - Create new GPO: "Employee Manager Deployment"
   - Navigate to: Computer Configuration → Policies → Software Settings → Software Installation
   - Right-click → New → Package
   - Select the MSI file from network share
   - Choose "Assigned" deployment method

3. **Configure Installation Options**:
   ```xml
   <!-- Custom installation properties -->
   <Property Id="SERVER_URL" Value="https://your-server.com:3001" />
   <Property Id="AUTO_CONNECT" Value="true" />
   ```

#### PowerShell Deployment Script
```powershell
# Employee Manager Deployment Script
# Run as Administrator

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$InstallPath = "C:\Program Files\Employee Manager"
)

# Download and install application
$msiPath = "Employee Manager_1.0.0_x64_en-US.msi"
$logPath = "$env:TEMP\EmployeeManager_Install.log"

Write-Host "Installing Employee Manager..." -ForegroundColor Green

# Install with custom properties
Start-Process msiexec.exe -Wait -ArgumentList @(
    "/i", $msiPath,
    "/quiet",
    "/norestart",
    "/l*v", $logPath,
    "SERVER_URL=$ServerUrl",
    "AUTO_CONNECT=true"
)

# Verify installation
if (Test-Path "$InstallPath\Employee Manager.exe") {
    Write-Host "Installation completed successfully!" -ForegroundColor Green
    
    # Create desktop shortcut
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Employee Manager.lnk")
    $Shortcut.TargetPath = "$InstallPath\Employee Manager.exe"
    $Shortcut.Save()
    
    Write-Host "Desktop shortcut created!" -ForegroundColor Green
} else {
    Write-Host "Installation failed. Check log: $logPath" -ForegroundColor Red
    exit 1
}
```

### Method 3: Docker Container Deployment

#### Prerequisites
- Docker Desktop for Windows
- Windows Subsystem for Linux (WSL2)

#### Container Deployment
```dockerfile
# Dockerfile for Windows client
FROM mcr.microsoft.com/windows/servercore:ltsc2022

# Copy application files
COPY Employee\ Manager.exe /app/
COPY config/ /app/config/

# Set working directory
WORKDIR /app

# Expose port (if needed for local services)
EXPOSE 3000

# Run application
CMD ["Employee Manager.exe"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  employee-manager:
    build: .
    container_name: employee-manager-client
    environment:
      - SERVER_URL=https://your-server.com:3001
      - AUTO_CONNECT=true
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

## Configuration

### Server Connection Settings

#### Basic Configuration
1. **Server URL**: `https://your-server.com:3001`
2. **Connection Timeout**: 30 seconds (default)
3. **Retry Attempts**: 3 (default)
4. **Auto-reconnect**: Enabled (default)

#### Advanced Configuration
```json
{
  "server": {
    "url": "https://your-server.com:3001",
    "timeout": 30000,
    "retries": 3,
    "autoReconnect": true,
    "verifySSL": true
  },
  "client": {
    "autoRefresh": true,
    "refreshInterval": 5,
    "defaultView": "employees",
    "itemsPerPage": 25
  }
}
```

### Network Configuration

#### Firewall Rules
```powershell
# Allow Employee Manager through Windows Firewall
New-NetFirewallRule -DisplayName "Employee Manager" -Direction Inbound -Program "C:\Program Files\Employee Manager\Employee Manager.exe" -Action Allow
New-NetFirewallRule -DisplayName "Employee Manager Outbound" -Direction Outbound -Program "C:\Program Files\Employee Manager\Employee Manager.exe" -Action Allow
```

#### Proxy Configuration
If behind a corporate proxy:
1. Configure proxy settings in Windows
2. Ensure proxy allows HTTPS connections to server
3. Add server URL to proxy bypass list if needed

## Troubleshooting

### Common Issues

#### 1. Connection Failed
**Symptoms**: "Connection Failed" error when testing server connection

**Solutions**:
- Verify server URL is correct and accessible
- Check network connectivity: `ping your-server.com`
- Test with browser: `https://your-server.com:3001/api/health`
- Verify firewall settings
- Check proxy configuration

#### 2. SSL Certificate Issues
**Symptoms**: SSL/TLS certificate errors

**Solutions**:
- Verify server certificate is valid
- Add server certificate to trusted root store
- Use HTTP instead of HTTPS (not recommended for production)
- Update system certificates

#### 3. Application Won't Start
**Symptoms**: Application fails to launch

**Solutions**:
- Run as Administrator
- Check Windows Event Viewer for errors
- Verify all dependencies are installed
- Reinstall the application
- Check antivirus software blocking

#### 4. Performance Issues
**Symptoms**: Slow loading or unresponsive interface

**Solutions**:
- Close other applications to free memory
- Check network latency to server
- Reduce auto-refresh interval
- Update graphics drivers
- Restart the application

### Diagnostic Commands

```powershell
# Test network connectivity
Test-NetConnection -ComputerName "your-server.com" -Port 3001

# Check application processes
Get-Process "Employee Manager" -ErrorAction SilentlyContinue

# View application logs
Get-Content "$env:APPDATA\Employee Manager\logs\app.log" -Tail 50

# Check Windows Event Log
Get-WinEvent -LogName "Application" -FilterHashtable @{ID=1000} | Where-Object {$_.Message -like "*Employee Manager*"}
```

## Security Considerations

### Network Security
- Use HTTPS for all server communications
- Implement certificate pinning for production
- Use VPN for remote access
- Configure proper firewall rules

### Application Security
- Run with minimal required permissions
- Enable Windows Defender real-time protection
- Keep application updated
- Use secure storage for sensitive data

### Data Protection
- Encrypt local data storage
- Implement secure credential storage
- Use secure communication protocols
- Regular security updates

## Maintenance

### Updates
1. **Automatic Updates**: Configure automatic update checking
2. **Manual Updates**: Download and install new versions
3. **Enterprise Updates**: Use Group Policy for centralized updates

### Backup
```powershell
# Backup application data
$backupPath = "C:\Backups\EmployeeManager\"
$dataPath = "$env:APPDATA\Employee Manager\"

New-Item -ItemType Directory -Path $backupPath -Force
Copy-Item -Path $dataPath -Destination $backupPath -Recurse -Force

Write-Host "Backup completed: $backupPath" -ForegroundColor Green
```

### Monitoring
- Monitor application performance
- Track connection status
- Log user activities
- Monitor system resources

## Support

### Log Files
- **Application Logs**: `%APPDATA%\Employee Manager\logs\`
- **Windows Event Log**: Event Viewer → Windows Logs → Application
- **Installation Logs**: `%TEMP%\EmployeeManager_Install.log`

### Contact Information
- **Technical Support**: [Your support email]
- **Documentation**: [Your documentation URL]
- **Issue Tracking**: [Your issue tracking system]

## Appendix

### Build Information
- **Version**: 1.0.0
- **Build Date**: [Current Date]
- **Target Platform**: Windows 11 x64
- **Dependencies**: None (standalone executable)

### API Endpoints
The client requires these server endpoints:
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/departments` - Department statistics
- `GET /api/health` - Health check

### Configuration Files
- **Main Config**: `%APPDATA%\Employee Manager\config.json`
- **User Settings**: `%APPDATA%\Employee Manager\settings.json`
- **Log Config**: `%APPDATA%\Employee Manager\logging.json`

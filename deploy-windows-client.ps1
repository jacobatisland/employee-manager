# Employee Manager Windows Client Deployment Script
# Run as Administrator for system-wide installation

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$InstallPath = "C:\Program Files\Employee Manager",
    
    [Parameter(Mandatory=$false)]
    [string]$MsiPath = "Employee Manager_1.0.0_x64_en-US.msi",
    
    [Parameter(Mandatory=$false)]
    [switch]$CreateDesktopShortcut = $true,
    
    [Parameter(Mandatory=$false)]
    [switch]$CreateStartMenuShortcut = $true,
    
    [Parameter(Mandatory=$false)]
    [switch]$ConfigureFirewall = $true,
    
    [Parameter(Mandatory=$false)]
    [switch]$Silent = $false
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Function to write colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Function to validate server URL
function Test-ServerUrl {
    param([string]$Url)
    
    try {
        $uri = [System.Uri]::new($Url)
        return ($uri.Scheme -eq "http" -or $uri.Scheme -eq "https")
    }
    catch {
        return $false
    }
}

# Function to test server connectivity
function Test-ServerConnectivity {
    param([string]$Url)
    
    try {
        $healthUrl = "$Url/api/health"
        $response = Invoke-WebRequest -Uri $healthUrl -Method GET -TimeoutSec 30 -UseBasicParsing
        return $response.StatusCode -eq 200
    }
    catch {
        Write-ColorOutput "Warning: Could not verify server connectivity at $Url" "Yellow"
        Write-ColorOutput "Error: $($_.Exception.Message)" "Red"
        return $false
    }
}

# Main deployment function
function Deploy-EmployeeManager {
    Write-ColorOutput "===============================================" "Cyan"
    Write-ColorOutput "Employee Manager Windows Client Deployment" "Cyan"
    Write-ColorOutput "===============================================" "Cyan"
    Write-ColorOutput ""
    
    # Check if running as administrator
    if (-not (Test-Administrator)) {
        Write-ColorOutput "Error: This script must be run as Administrator" "Red"
        Write-ColorOutput "Please right-click PowerShell and select 'Run as Administrator'" "Yellow"
        exit 1
    }
    
    # Validate server URL
    if (-not (Test-ServerUrl -Url $ServerUrl)) {
        Write-ColorOutput "Error: Invalid server URL format: $ServerUrl" "Red"
        Write-ColorOutput "Please provide a valid URL (e.g., https://your-server.com:3001)" "Yellow"
        exit 1
    }
    
    # Test server connectivity
    Write-ColorOutput "Testing server connectivity..." "Yellow"
    if (-not (Test-ServerConnectivity -Url $ServerUrl)) {
        $continue = Read-Host "Server connectivity test failed. Continue with installation? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            Write-ColorOutput "Installation cancelled." "Red"
            exit 1
        }
    } else {
        Write-ColorOutput "Server connectivity verified!" "Green"
    }
    
    # Check if MSI file exists
    if (-not (Test-Path $MsiPath)) {
        Write-ColorOutput "Error: MSI file not found: $MsiPath" "Red"
        Write-ColorOutput "Please ensure the MSI file is in the current directory or provide the full path" "Yellow"
        exit 1
    }
    
    # Create installation directory
    Write-ColorOutput "Creating installation directory: $InstallPath" "Yellow"
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    
    # Install the application
    Write-ColorOutput "Installing Employee Manager..." "Yellow"
    $logPath = "$env:TEMP\EmployeeManager_Install_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
    
    $installArgs = @(
        "/i", "`"$MsiPath`"",
        "/quiet",
        "/norestart",
        "/l*v", "`"$logPath`"",
        "SERVER_URL=$ServerUrl",
        "AUTO_CONNECT=true"
    )
    
    try {
        $process = Start-Process -FilePath "msiexec.exe" -ArgumentList $installArgs -Wait -PassThru
        
        if ($process.ExitCode -eq 0) {
            Write-ColorOutput "Installation completed successfully!" "Green"
        } else {
            Write-ColorOutput "Installation failed with exit code: $($process.ExitCode)" "Red"
            Write-ColorOutput "Check installation log: $logPath" "Yellow"
            exit 1
        }
    }
    catch {
        Write-ColorOutput "Error during installation: $($_.Exception.Message)" "Red"
        exit 1
    }
    
    # Verify installation
    $exePath = "$InstallPath\Employee Manager.exe"
    if (Test-Path $exePath) {
        Write-ColorOutput "Application installed successfully at: $exePath" "Green"
    } else {
        Write-ColorOutput "Error: Application not found after installation" "Red"
        exit 1
    }
    
    # Create desktop shortcut
    if ($CreateDesktopShortcut) {
        Write-ColorOutput "Creating desktop shortcut..." "Yellow"
        try {
            $WshShell = New-Object -ComObject WScript.Shell
            $Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Employee Manager.lnk")
            $Shortcut.TargetPath = $exePath
            $Shortcut.Arguments = "--server-url=`"$ServerUrl`""
            $Shortcut.Description = "Employee Management System"
            $Shortcut.Save()
            Write-ColorOutput "Desktop shortcut created!" "Green"
        }
        catch {
            Write-ColorOutput "Warning: Could not create desktop shortcut: $($_.Exception.Message)" "Yellow"
        }
    }
    
    # Create Start Menu shortcut
    if ($CreateStartMenuShortcut) {
        Write-ColorOutput "Creating Start Menu shortcut..." "Yellow"
        try {
            $startMenuPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs"
            $WshShell = New-Object -ComObject WScript.Shell
            $Shortcut = $WshShell.CreateShortcut("$startMenuPath\Employee Manager.lnk")
            $Shortcut.TargetPath = $exePath
            $Shortcut.Arguments = "--server-url=`"$ServerUrl`""
            $Shortcut.Description = "Employee Management System"
            $Shortcut.Save()
            Write-ColorOutput "Start Menu shortcut created!" "Green"
        }
        catch {
            Write-ColorOutput "Warning: Could not create Start Menu shortcut: $($_.Exception.Message)" "Yellow"
        }
    }
    
    # Configure Windows Firewall
    if ($ConfigureFirewall) {
        Write-ColorOutput "Configuring Windows Firewall..." "Yellow"
        try {
            # Allow inbound connections
            New-NetFirewallRule -DisplayName "Employee Manager Inbound" -Direction Inbound -Program $exePath -Action Allow -ErrorAction SilentlyContinue | Out-Null
            
            # Allow outbound connections
            New-NetFirewallRule -DisplayName "Employee Manager Outbound" -Direction Outbound -Program $exePath -Action Allow -ErrorAction SilentlyContinue | Out-Null
            
            Write-ColorOutput "Firewall rules configured!" "Green"
        }
        catch {
            Write-ColorOutput "Warning: Could not configure firewall rules: $($_.Exception.Message)" "Yellow"
        }
    }
    
    # Create configuration file
    Write-ColorOutput "Creating configuration file..." "Yellow"
    $configPath = "$env:APPDATA\Employee Manager"
    New-Item -ItemType Directory -Path $configPath -Force | Out-Null
    
    $config = @{
        server = @{
            url = $ServerUrl
            timeout = 30000
            retries = 3
            autoReconnect = $true
            verifySSL = $true
        }
        client = @{
            autoRefresh = $true
            refreshInterval = 5
            defaultView = "employees"
            itemsPerPage = 25
        }
    }
    
    $config | ConvertTo-Json -Depth 3 | Out-File -FilePath "$configPath\config.json" -Encoding UTF8
    Write-ColorOutput "Configuration file created at: $configPath\config.json" "Green"
    
    # Final verification
    Write-ColorOutput ""
    Write-ColorOutput "===============================================" "Green"
    Write-ColorOutput "Deployment Summary" "Green"
    Write-ColorOutput "===============================================" "Green"
    Write-ColorOutput "Server URL: $ServerUrl" "White"
    Write-ColorOutput "Installation Path: $InstallPath" "White"
    Write-ColorOutput "Configuration Path: $configPath" "White"
    Write-ColorOutput "Desktop Shortcut: $CreateDesktopShortcut" "White"
    Write-ColorOutput "Start Menu Shortcut: $CreateStartMenuShortcut" "White"
    Write-ColorOutput "Firewall Configured: $ConfigureFirewall" "White"
    Write-ColorOutput ""
    Write-ColorOutput "Installation log: $logPath" "Cyan"
    Write-ColorOutput ""
    Write-ColorOutput "Deployment completed successfully!" "Green"
    Write-ColorOutput "You can now launch Employee Manager from the desktop or Start Menu." "Green"
}

# Run the deployment
Deploy-EmployeeManager

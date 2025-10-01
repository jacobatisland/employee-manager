# Visual Studio Build Tools Installation Script
# Installs the minimal required components for Tauri MSI building

param(
    [Parameter(Mandatory=$false)]
    [switch]$Silent = $true
)

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-AdminRights {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

try {
    Write-ColorOutput "==========================================================" "Cyan"
    Write-ColorOutput "Visual Studio Build Tools Installer for Tauri MSI" "Cyan"
    Write-ColorOutput "==========================================================" "Cyan"
    Write-ColorOutput ""
    
    # Check admin rights
    if (-not (Test-AdminRights)) {
        Write-ColorOutput "ERROR: This script must be run as Administrator" "Red"
        Write-ColorOutput "Please right-click PowerShell and select 'Run as Administrator'" "Yellow"
        exit 1
    }
    
    Write-ColorOutput "Downloading Visual Studio Build Tools installer..." "Yellow"
    
    # Download VS Build Tools bootstrapper
    $installerUrl = "https://aka.ms/vs/17/release/vs_buildtools.exe"
    $installerPath = "$env:TEMP\vs_buildtools.exe"
    
    Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing
    Write-ColorOutput "Downloaded installer to: $installerPath" "Green"
    
    Write-ColorOutput ""
    Write-ColorOutput "Installing Visual Studio Build Tools..." "Yellow"
    Write-ColorOutput "This will take several minutes (5-15 min depending on connection)..." "Cyan"
    Write-ColorOutput ""
    
    # Install with required workloads for Tauri
    $installArgs = @(
        "--quiet",
        "--wait",
        "--norestart",
        "--nocache",
        "--add", "Microsoft.VisualStudio.Workload.VCTools",
        "--add", "Microsoft.VisualStudio.Component.VC.Tools.x86.x64",
        "--add", "Microsoft.VisualStudio.Component.Windows11SDK.22000"
    )
    
    $process = Start-Process -FilePath $installerPath -ArgumentList $installArgs -Wait -PassThru -NoNewWindow
    
    if ($process.ExitCode -eq 0 -or $process.ExitCode -eq 3010) {
        Write-ColorOutput ""
        Write-ColorOutput "Visual Studio Build Tools installed successfully!" "Green"
        
        if ($process.ExitCode -eq 3010) {
            Write-ColorOutput ""
            Write-ColorOutput "NOTE: A reboot is recommended but not required immediately." "Yellow"
        }
    } else {
        Write-ColorOutput ""
        Write-ColorOutput "Installation completed with exit code: $($process.ExitCode)" "Yellow"
        Write-ColorOutput "This may indicate a partial installation or that tools were already installed." "Yellow"
    }
    
    # Cleanup
    Write-ColorOutput ""
    Write-ColorOutput "Cleaning up installer..." "Yellow"
    Remove-Item -Path $installerPath -Force -ErrorAction SilentlyContinue
    
    Write-ColorOutput ""
    Write-ColorOutput "==========================================================" "Green"
    Write-ColorOutput "Installation Complete!" "Green"
    Write-ColorOutput "==========================================================" "Green"
    Write-ColorOutput ""
    Write-ColorOutput "Next steps:" "Yellow"
    Write-ColorOutput "1. You can now build the MSI installer" "White"
    Write-ColorOutput "2. Run: cd employee-manager" "White"
    Write-ColorOutput "3. Run: npm run tauri:build" "White"
    Write-ColorOutput ""
    
} catch {
    Write-ColorOutput ""
    Write-ColorOutput "==========================================================" "Red"
    Write-ColorOutput "Installation Failed!" "Red"
    Write-ColorOutput "==========================================================" "Red"
    Write-ColorOutput "Error: $($_.Exception.Message)" "Red"
    Write-ColorOutput ""
    Write-ColorOutput "You can manually install from:" "Yellow"
    Write-ColorOutput "https://visualstudio.microsoft.com/downloads/" "Cyan"
    Write-ColorOutput "Select 'Build Tools for Visual Studio 2022'" "White"
    exit 1
}


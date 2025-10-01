# Complete Automated MSI Setup for Employee Manager
# This script installs all requirements and builds the MSI installer

param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipVSBuildTools = $false
)

$ErrorActionPreference = "Continue"

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host ""
    Write-Host "========================================" -ForegroundColor $Color
    Write-Host $Message -ForegroundColor $Color
    Write-Host "========================================" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "→ $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Test-AdminRights {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Start
Write-Step "Employee Manager MSI Installer - Automated Setup"

# Step 1: Check prerequisites
Write-Step "Step 1: Checking Prerequisites" "Yellow"

# Check Rust
try {
    $rustVersion = & rustc --version 2>$null
    Write-Success "Rust: $rustVersion"
    $rustInstalled = $true
} catch {
    Write-Error-Custom "Rust not found"
    $rustInstalled = $false
}

# Check Cargo
try {
    $cargoVersion = & cargo --version 2>$null
    Write-Success "Cargo: $cargoVersion"
} catch {
    Write-Error-Custom "Cargo not found"
}

# Check Node.js
try {
    $env:PATH += ";C:\Program Files\nodejs"
    $nodeVersion = & node --version 2>$null
    Write-Success "Node.js: $nodeVersion"
} catch {
    Write-Error-Custom "Node.js not found"
}

# Check Tauri CLI
Write-Info "Checking Tauri CLI installation status..."
$tauriInstalled = $false
try {
    $env:PATH += ";$env:USERPROFILE\.cargo\bin"
    $tauriVersion = & cargo tauri --version 2>$null
    if ($tauriVersion) {
        Write-Success "Tauri CLI: $tauriVersion"
        $tauriInstalled = $true
    }
} catch {
    Write-Info "Tauri CLI not yet installed (may still be installing in background)"
}

# Check Visual Studio Build Tools
Write-Info "Checking Visual Studio Build Tools..."
$vsBuildToolsInstalled = $false
$possiblePaths = @(
    "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\*\bin\Hostx64\x64\cl.exe",
    "C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\*\bin\Hostx64\x64\cl.exe",
    "C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\VC\Tools\MSVC\*\bin\Hostx64\x64\cl.exe"
)

foreach ($path in $possiblePaths) {
    $found = Get-Item $path -ErrorAction SilentlyContinue
    if ($found) {
        Write-Success "Visual Studio Build Tools found at: $($found[0].Directory.Parent.Parent.Parent.Parent.FullName)"
        $vsBuildToolsInstalled = $true
        break
    }
}

if (-not $vsBuildToolsInstalled) {
    Write-Info "Visual Studio Build Tools not detected"
}

# Step 2: Install Visual Studio Build Tools if needed
if (-not $vsBuildToolsInstalled -and -not $SkipVSBuildTools) {
    Write-Step "Step 2: Installing Visual Studio Build Tools" "Yellow"
    
    if (-not (Test-AdminRights)) {
        Write-Error-Custom "Administrator rights required for VS Build Tools installation"
        Write-Info "Please run this script as Administrator, or install manually:"
        Write-Info "1. Press Win+R, type: %TEMP%, press Enter"
        Write-Info "2. Run vs_buildtools.exe"
        Write-Info "3. Select 'Desktop development with C++'"
        exit 1
    }
    
    $installerPath = "$env:TEMP\vs_buildtools.exe"
    
    if (-not (Test-Path $installerPath)) {
        Write-Info "Downloading Visual Studio Build Tools..."
        try {
            Invoke-WebRequest -Uri "https://aka.ms/vs/17/release/vs_buildtools.exe" -OutFile $installerPath -UseBasicParsing
            Write-Success "Downloaded VS Build Tools installer"
        } catch {
            Write-Error-Custom "Failed to download VS Build Tools"
            Write-Info "Please download manually from: https://aka.ms/vs/17/release/vs_buildtools.exe"
            exit 1
        }
    } else {
        Write-Success "VS Build Tools installer already downloaded"
    }
    
    Write-Info "Installing Visual Studio Build Tools..."
    Write-Info "This will take 5-15 minutes. Please wait..."
    
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
        Write-Success "Visual Studio Build Tools installed successfully"
        $vsBuildToolsInstalled = $true
    } else {
        Write-Error-Custom "VS Build Tools installation returned code: $($process.ExitCode)"
    }
} else {
    Write-Step "Step 2: Visual Studio Build Tools" "Green"
    if ($vsBuildToolsInstalled) {
        Write-Success "Already installed"
    } else {
        Write-Info "Skipped (use -SkipVSBuildTools:$false to install)"
    }
}

# Step 3: Wait for Tauri CLI if still installing
if (-not $tauriInstalled) {
    Write-Step "Step 3: Waiting for Tauri CLI Installation" "Yellow"
    Write-Info "Tauri CLI may still be installing in background..."
    Write-Info "Checking every 10 seconds (max 10 minutes)..."
    
    $maxWaitTime = 600  # 10 minutes
    $waited = 0
    
    while ($waited -lt $maxWaitTime) {
        Start-Sleep -Seconds 10
        $waited += 10
        
        try {
            $env:PATH += ";$env:USERPROFILE\.cargo\bin"
            $tauriVersion = & cargo tauri --version 2>$null
            if ($tauriVersion) {
                Write-Success "Tauri CLI ready: $tauriVersion"
                $tauriInstalled = $true
                break
            }
        } catch {
            Write-Host "." -NoNewline
        }
    }
    
    if (-not $tauriInstalled) {
        Write-Error-Custom "Tauri CLI not ready after waiting"
        Write-Info "You may need to install it manually: cargo install tauri-cli"
        exit 1
    }
} else {
    Write-Step "Step 3: Tauri CLI" "Green"
    Write-Success "Already installed"
}

# Step 4: Build the MSI
Write-Step "Step 4: Building MSI Installer" "Yellow"

if (-not $vsBuildToolsInstalled) {
    Write-Error-Custom "Cannot build MSI without Visual Studio Build Tools"
    Write-Info "Please install VS Build Tools and run this script again"
    exit 1
}

Write-Info "Navigating to project directory..."
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\employee-manager"
Write-Success "Working directory: $(Get-Location)"

Write-Info "Building Employee Manager with Tauri..."
Write-Info "This will take 10-20 minutes on first build..."
Write-Host ""

$env:PATH += ";$env:USERPROFILE\.cargo\bin;C:\Program Files\nodejs"

try {
    & cargo tauri build 2>&1 | ForEach-Object {
        Write-Host $_
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Step "BUILD SUCCESS!" "Green"
        
        $msiPath = "src-tauri\target\release\bundle\msi"
        if (Test-Path $msiPath) {
            Write-Success "MSI Installer created successfully!"
            Write-Host ""
            Write-Host "MSI Location:" -ForegroundColor Cyan
            Get-ChildItem $msiPath -Filter "*.msi" | ForEach-Object {
                Write-Host "  → $($_.FullName)" -ForegroundColor Green
                Write-Host "  → Size: $([math]::Round($_.Length / 1MB, 2)) MB" -ForegroundColor Yellow
            }
        } else {
            Write-Info "Build completed but MSI not found at expected location"
        }
    } else {
        Write-Error-Custom "Build failed with exit code: $LASTEXITCODE"
    }
} catch {
    Write-Error-Custom "Build failed: $_"
    exit 1
}

Write-Step "Setup Complete!" "Green"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test the MSI installer" -ForegroundColor White
Write-Host "2. Deploy to target machines" -ForegroundColor White
Write-Host ""

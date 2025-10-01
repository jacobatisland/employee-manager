# Employee Manager MSI Builder
# PowerShell script to build Windows MSI installer for the Employee Manager application

param(
    [Parameter(Mandatory=$false)]
    [string]$Configuration = "release",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = ".\dist\msi",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipClean = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose = $false
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

# Function to check prerequisites
function Test-Prerequisites {
    Write-ColorOutput "Checking prerequisites..." "Yellow"
    
    # Check if Node.js is installed
    try {
        $nodeVersion = & node --version 2>$null
        Write-ColorOutput "✓ Node.js: $nodeVersion" "Green"
    }
    catch {
        Write-ColorOutput "✗ Node.js not found. Please install Node.js." "Red"
        return $false
    }
    
    # Check if Rust is installed
    try {
        $rustVersion = & rustc --version 2>$null
        Write-ColorOutput "✓ Rust: $rustVersion" "Green"
    }
    catch {
        Write-ColorOutput "✗ Rust not found. Please install Rust." "Red"
        return $false
    }
    
    # Check if Tauri CLI is installed
    try {
        $tauriVersion = & npx tauri --version 2>$null
        Write-ColorOutput "✓ Tauri CLI: $tauriVersion" "Green"
    }
    catch {
        Write-ColorOutput "✗ Tauri CLI not found. Installing..." "Yellow"
        npm install -g @tauri-apps/cli
    }
    
    # Check if WiX Toolset is available (for MSI building)
    try {
        $wixVersion = & candle.exe -? 2>$null | Select-String "Windows Installer XML" | Select-Object -First 1
        if ($wixVersion) {
            Write-ColorOutput "✓ WiX Toolset: Available" "Green"
        } else {
            Write-ColorOutput "ℹ WiX Toolset not found in PATH. Tauri will attempt to use built-in WiX." "Yellow"
        }
    }
    catch {
        Write-ColorOutput "ℹ WiX Toolset not found in PATH. Tauri will attempt to use built-in WiX." "Yellow"
    }
    
    return $true
}

# Function to clean previous builds
function Clear-PreviousBuilds {
    if ($SkipClean) {
        Write-ColorOutput "Skipping clean (--SkipClean specified)" "Yellow"
        return
    }
    
    Write-ColorOutput "Cleaning previous builds..." "Yellow"
    
    $paths = @(
        "employee-manager\dist",
        "employee-manager\src-tauri\target\release\bundle",
        $OutputPath
    )
    
    foreach ($path in $paths) {
        if (Test-Path $path) {
            try {
                Remove-Item -Path $path -Recurse -Force
                Write-ColorOutput "✓ Cleaned: $path" "Green"
            }
            catch {
                Write-ColorOutput "⚠ Could not clean: $path - $($_.Exception.Message)" "Yellow"
            }
        }
    }
}

# Function to build the frontend
function Build-Frontend {
    Write-ColorOutput "Building frontend..." "Yellow"
    
    Set-Location "employee-manager"
    
    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-ColorOutput "Installing Node.js dependencies..." "Yellow"
        npm install
    }
    
    # Build the frontend
    Write-ColorOutput "Building React application..." "Yellow"
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "✗ Frontend build failed" "Red"
        Set-Location ".."
        exit 1
    }
    
    Write-ColorOutput "✓ Frontend build completed" "Green"
    Set-Location ".."
}

# Function to build the Tauri application
function Build-TauriApp {
    Write-ColorOutput "Building Tauri application..." "Yellow"
    
    Set-Location "employee-manager"
    
    # Build arguments
    $buildArgs = @("tauri", "build")
    
    if ($Configuration -eq "debug") {
        $buildArgs += "--debug"
    }
    
    if ($Verbose) {
        $buildArgs += "--verbose"
    }
    
    # Execute build
    Write-ColorOutput "Executing: npm run $($buildArgs -join ' ')" "Cyan"
    
    if ($Configuration -eq "debug") {
        npm run tauri:build:debug
    } else {
        npm run tauri:build
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "✗ Tauri build failed" "Red"
        Set-Location ".."
        exit 1
    }
    
    Write-ColorOutput "✓ Tauri build completed" "Green"
    Set-Location ".."
}

# Function to organize build outputs
function Copy-BuildOutputs {
    Write-ColorOutput "Organizing build outputs..." "Yellow"
    
    # Create output directory
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    
    # Define source and target paths
    $sourcePath = "employee-manager\src-tauri\target\release\bundle"
    
    if (-not (Test-Path $sourcePath)) {
        Write-ColorOutput "✗ Build output not found at: $sourcePath" "Red"
        return $false
    }
    
    # Copy MSI files
    $msiPath = "$sourcePath\msi"
    if (Test-Path $msiPath) {
        $msiFiles = Get-ChildItem -Path $msiPath -Filter "*.msi" -File
        foreach ($msiFile in $msiFiles) {
            $targetPath = Join-Path $OutputPath $msiFile.Name
            Copy-Item -Path $msiFile.FullName -Destination $targetPath -Force
            Write-ColorOutput "✓ Copied MSI: $($msiFile.Name)" "Green"
        }
        
        if ($msiFiles.Count -eq 0) {
            Write-ColorOutput "⚠ No MSI files found in build output" "Yellow"
        }
    } else {
        Write-ColorOutput "⚠ MSI output directory not found: $msiPath" "Yellow"
    }
    
    # Copy executable
    $exePath = "employee-manager\src-tauri\target\release\employee-manager.exe"
    if (Test-Path $exePath) {
        $targetExePath = Join-Path $OutputPath "employee-manager.exe"
        Copy-Item -Path $exePath -Destination $targetExePath -Force
        Write-ColorOutput "✓ Copied executable: employee-manager.exe" "Green"
    }
    
    return $true
}

# Function to generate installer metadata
function New-InstallerMetadata {
    Write-ColorOutput "Generating installer metadata..." "Yellow"
    
    $metadata = @{
        product = @{
            name = "Employee Manager"
            version = "1.0.0"
            publisher = "Demo Company"
            identifier = "com.demo.employee-manager"
        }
        build = @{
            timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            configuration = $Configuration
            platform = "Windows x64"
            tauri_version = (& npx tauri --version 2>$null)
            node_version = (& node --version 2>$null)
            rust_version = (& rustc --version 2>$null)
        }
        files = @()
    }
    
    # Add file information
    if (Test-Path $OutputPath) {
        $files = Get-ChildItem -Path $OutputPath -File
        foreach ($file in $files) {
            $fileInfo = @{
                name = $file.Name
                size = $file.Length
                hash = (Get-FileHash -Path $file.FullName -Algorithm SHA256).Hash
                created = $file.CreationTime.ToString("yyyy-MM-dd HH:mm:ss")
            }
            $metadata.files += $fileInfo
        }
    }
    
    # Save metadata
    $metadataPath = Join-Path $OutputPath "installer-metadata.json"
    $metadata | ConvertTo-Json -Depth 3 | Out-File -FilePath $metadataPath -Encoding UTF8
    Write-ColorOutput "✓ Metadata saved: installer-metadata.json" "Green"
}

# Function to create deployment package
function New-DeploymentPackage {
    Write-ColorOutput "Creating deployment package..." "Yellow"
    
    # Copy deployment scripts
    $deploymentFiles = @(
        "deploy-windows-client.ps1",
        "deploy-windows-client.bat",
        "WINDOWS_DEPLOYMENT.md"
    )
    
    foreach ($file in $deploymentFiles) {
        if (Test-Path $file) {
            Copy-Item -Path $file -Destination $OutputPath -Force
            Write-ColorOutput "✓ Copied deployment file: $file" "Green"
        }
    }
    
    # Create README for deployment
    $readmeContent = @"
# Employee Manager Deployment Package

## Contents
- 'Employee Manager_1.0.0_x64_en-US.msi' - Windows MSI Installer
- 'employee-manager.exe' - Portable executable (optional)
- 'deploy-windows-client.ps1' - PowerShell deployment script
- 'deploy-windows-client.bat' - Batch deployment script
- 'WINDOWS_DEPLOYMENT.md' - Detailed deployment guide
- 'installer-metadata.json' - Build and file metadata

## Quick Start

### Option 1: Direct Installation
1. Double-click the MSI file
2. Follow the installation wizard
3. Launch the application and configure server settings

### Option 2: Automated Deployment
PowerShell command:
.\deploy-windows-client.ps1 -ServerUrl "https://your-server.com:3001"

### Option 3: Enterprise Deployment
Batch command:
deploy-windows-client.bat https://your-server.com:3001

## System Requirements
- Windows 10/11 (64-bit)
- 100MB free disk space
- Network access to the Employee Manager server

## Support
For detailed deployment instructions, see WINDOWS_DEPLOYMENT.md

Built on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Version: 1.0.0
Platform: Windows x64
"@
    
    $readmePath = Join-Path $OutputPath "README.md"
    $readmeContent | Out-File -FilePath $readmePath -Encoding UTF8
    Write-ColorOutput "✓ Created deployment README" "Green"
}

# Main build function
function Start-MSIBuild {
    Write-ColorOutput "===============================================" "Cyan"
    Write-ColorOutput "Employee Manager MSI Builder" "Cyan"
    Write-ColorOutput "===============================================" "Cyan"
    Write-ColorOutput ""
    
    Write-ColorOutput "Configuration: $Configuration" "White"
    Write-ColorOutput "Output Path: $OutputPath" "White"
    Write-ColorOutput ""
    
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        Write-ColorOutput "✗ Prerequisites check failed" "Red"
        exit 1
    }
    
    Write-ColorOutput ""
    
    # Clean previous builds
    Clear-PreviousBuilds
    
    if (-not $SkipBuild) {
        # Build frontend
        Build-Frontend
        
        Write-ColorOutput ""
        
        # Build Tauri application
        Build-TauriApp
    } else {
        Write-ColorOutput "Skipping build (--SkipBuild specified)" "Yellow"
    }
    
    Write-ColorOutput ""
    
    # Copy build outputs
    if (-not (Copy-BuildOutputs)) {
        Write-ColorOutput "✗ Failed to copy build outputs" "Red"
        exit 1
    }
    
    Write-ColorOutput ""
    
    # Generate metadata
    New-InstallerMetadata
    
    # Create deployment package
    New-DeploymentPackage
    
    Write-ColorOutput ""
    Write-ColorOutput "===============================================" "Green"
    Write-ColorOutput "MSI Build Completed Successfully!" "Green"
    Write-ColorOutput "===============================================" "Green"
    Write-ColorOutput ""
    Write-ColorOutput "Output Location: $OutputPath" "White"
    
    # List generated files
    if (Test-Path $OutputPath) {
        Write-ColorOutput ""
        Write-ColorOutput "Generated Files:" "Yellow"
        $files = Get-ChildItem -Path $OutputPath -File
        foreach ($file in $files) {
            $sizeKB = [math]::Round($file.Length / 1KB, 1)
            Write-ColorOutput "  • $($file.Name) ($sizeKB KB)" "White"
        }
    }
    
    Write-ColorOutput ""
    Write-ColorOutput "Next Steps:" "Yellow"
    Write-ColorOutput "1. Test the MSI installer on a clean Windows machine" "White"
    Write-ColorOutput "2. Deploy using the included deployment scripts" "White"
    Write-ColorOutput "3. See WINDOWS_DEPLOYMENT.md for detailed instructions" "White"
    Write-ColorOutput ""
}

# Execute the build
try {
    Start-MSIBuild
}
catch {
    Write-ColorOutput ""
    Write-ColorOutput "===============================================" "Red"
    Write-ColorOutput "Build Failed!" "Red"
    Write-ColorOutput "===============================================" "Red"
    Write-ColorOutput "Error: $($_.Exception.Message)" "Red"
    Write-ColorOutput ""
    exit 1
}

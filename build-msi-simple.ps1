# Employee Manager MSI Builder - Simplified Version
# PowerShell script to build Windows MSI installer for the Employee Manager application

param(
    [Parameter(Mandatory=$false)]
    [string]$Configuration = "release",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = ".\dist\msi",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipClean = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-Prerequisites {
    Write-ColorOutput "Checking prerequisites..." "Yellow"
    
    # Check Node.js
    try {
        $nodeVersion = & node --version 2>$null
        if ($nodeVersion) {
            Write-ColorOutput "✓ Node.js: $nodeVersion" "Green"
        } else {
            throw "Node.js not found"
        }
    }
    catch {
        Write-ColorOutput "✗ Node.js not found. Please install Node.js." "Red"
        return $false
    }
    
    # Check Rust
    try {
        $rustVersion = & rustc --version 2>$null
        if ($rustVersion) {
            Write-ColorOutput "✓ Rust: $rustVersion" "Green"
        } else {
            throw "Rust not found"
        }
    }
    catch {
        Write-ColorOutput "✗ Rust not found. Please install Rust." "Red"
        return $false
    }
    
    return $true
}

function Clear-PreviousBuilds {
    if ($SkipClean) {
        Write-ColorOutput "Skipping clean" "Yellow"
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
                Write-ColorOutput "⚠ Could not clean: $path" "Yellow"
            }
        }
    }
}

function Build-Application {
    Write-ColorOutput "Building application..." "Yellow"
    
    Set-Location "employee-manager"
    
    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-ColorOutput "Installing dependencies..." "Yellow"
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "✗ Dependencies installation failed" "Red"
            Set-Location ".."
            exit 1
        }
    }
    
    # Build frontend
    Write-ColorOutput "Building frontend..." "Yellow"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "✗ Frontend build failed" "Red"
        Set-Location ".."
        exit 1
    }
    
    # Build Tauri app
    Write-ColorOutput "Building Tauri application..." "Yellow"
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
    
    Write-ColorOutput "✓ Build completed successfully" "Green"
    Set-Location ".."
}

function Copy-BuildOutputs {
    Write-ColorOutput "Copying build outputs..." "Yellow"
    
    # Create output directory
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    
    # Copy MSI files
    $msiPath = "employee-manager\src-tauri\target\release\bundle\msi"
    if (Test-Path $msiPath) {
        $msiFiles = Get-ChildItem -Path $msiPath -Filter "*.msi" -File
        foreach ($msiFile in $msiFiles) {
            $targetPath = Join-Path $OutputPath $msiFile.Name
            Copy-Item -Path $msiFile.FullName -Destination $targetPath -Force
            Write-ColorOutput "✓ Copied MSI: $($msiFile.Name)" "Green"
        }
        
        if ($msiFiles.Count -eq 0) {
            Write-ColorOutput "⚠ No MSI files found" "Yellow"
        }
    } else {
        Write-ColorOutput "⚠ MSI directory not found: $msiPath" "Yellow"
    }
    
    # Copy executable
    $exePath = "employee-manager\src-tauri\target\release\employee-manager.exe"
    if (Test-Path $exePath) {
        Copy-Item -Path $exePath -Destination (Join-Path $OutputPath "employee-manager.exe") -Force
        Write-ColorOutput "✓ Copied executable" "Green"
    }
    
    # Copy deployment scripts
    $deploymentFiles = @(
        "deploy-windows-client.ps1",
        "deploy-windows-client.bat"
    )
    
    foreach ($file in $deploymentFiles) {
        if (Test-Path $file) {
            Copy-Item -Path $file -Destination $OutputPath -Force
            Write-ColorOutput "✓ Copied deployment script: $file" "Green"
        }
    }
    
    return $true
}

function New-DeploymentReadme {
    Write-ColorOutput "Creating deployment README..." "Yellow"
    
    $readmeContent = "# Employee Manager Deployment Package`n`n"
    $readmeContent += "## Files Included`n"
    $readmeContent += "- Employee Manager MSI installer`n"
    $readmeContent += "- Portable executable (employee-manager.exe)`n"
    $readmeContent += "- Deployment scripts (PowerShell and Batch)`n`n"
    $readmeContent += "## Quick Installation`n"
    $readmeContent += "1. Double-click the MSI file to install`n"
    $readmeContent += "2. Or run: .\deploy-windows-client.ps1 -ServerUrl 'https://your-server.com:3001'`n`n"
    $readmeContent += "## System Requirements`n"
    $readmeContent += "- Windows 10/11 (64-bit)`n"
    $readmeContent += "- 100MB free disk space`n"
    $readmeContent += "- Network access to Employee Manager server`n`n"
    $readmeContent += "Built on: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
    $readmeContent += "Version: 1.0.0`n"
    
    $readmePath = Join-Path $OutputPath "README.txt"
    $readmeContent | Out-File -FilePath $readmePath -Encoding UTF8
    Write-ColorOutput "✓ Created README.txt" "Green"
}

# Main execution
try {
    Write-ColorOutput "===============================================" "Cyan"
    Write-ColorOutput "Employee Manager MSI Builder" "Cyan"
    Write-ColorOutput "===============================================" "Cyan"
    Write-ColorOutput ""
    
    Write-ColorOutput "Configuration: $Configuration" "White"
    Write-ColorOutput "Output Path: $OutputPath" "White"
    Write-ColorOutput ""
    
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        exit 1
    }
    
    Write-ColorOutput ""
    
    # Clean previous builds
    Clear-PreviousBuilds
    
    Write-ColorOutput ""
    
    # Build application
    Build-Application
    
    Write-ColorOutput ""
    
    # Copy outputs
    if (-not (Copy-BuildOutputs)) {
        Write-ColorOutput "✗ Failed to copy build outputs" "Red"
        exit 1
    }
    
    # Create README
    New-DeploymentReadme
    
    Write-ColorOutput ""
    Write-ColorOutput "===============================================" "Green"
    Write-ColorOutput "MSI Build Completed Successfully!" "Green"
    Write-ColorOutput "===============================================" "Green"
    Write-ColorOutput ""
    Write-ColorOutput "Output Location: $OutputPath" "White"
    
    # List files
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
    Write-ColorOutput "🎉 MSI installer is ready for deployment!" "Green"
    Write-ColorOutput ""
}
catch {
    Write-ColorOutput ""
    Write-ColorOutput "===============================================" "Red"
    Write-ColorOutput "Build Failed!" "Red"
    Write-ColorOutput "===============================================" "Red"
    Write-ColorOutput "Error: $($_.Exception.Message)" "Red"
    exit 1
}

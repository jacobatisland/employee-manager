# Complete MSI Build Environment Setup
# This script sets up everything needed to build MSI installers for Employee Manager

param(
    [Parameter(Mandatory=$false)]
    [switch]$InstallRust = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$BuildMSI = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = ".\dist\msi"
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
    
    $allGood = $true
    
    # Check Node.js
    try {
        $env:PATH += ";C:\Program Files\nodejs"
        $nodeVersion = & node --version 2>$null
        if ($nodeVersion) {
            Write-ColorOutput "✓ Node.js: $nodeVersion" "Green"
        } else {
            Write-ColorOutput "✗ Node.js: Not found" "Red"
            $allGood = $false
        }
    }
    catch {
        Write-ColorOutput "✗ Node.js: Not found" "Red"
        $allGood = $false
    }
    
    # Check Rust
    try {
        $env:PATH += ";$env:USERPROFILE\.cargo\bin"
        $rustVersion = & rustc --version 2>$null
        if ($rustVersion) {
            Write-ColorOutput "✓ Rust: $rustVersion" "Green"
        } else {
            Write-ColorOutput "✗ Rust: Not found" "Red"
            if (-not $InstallRust) {
                Write-ColorOutput "  Use -InstallRust to install automatically" "Yellow"
            }
            $allGood = $false
        }
    }
    catch {
        Write-ColorOutput "✗ Rust: Not found" "Red"
        if (-not $InstallRust) {
            Write-ColorOutput "  Use -InstallRust to install automatically" "Yellow"
        }
        $allGood = $false
    }
    
    return $allGood
}

function Install-RustEnvironment {
    Write-ColorOutput "Installing Rust environment..." "Yellow"
    
    if (Test-Path ".\install-rust-windows.ps1") {
        Write-ColorOutput "Running Rust installer..." "Cyan"
        & powershell -ExecutionPolicy Bypass -File ".\install-rust-windows.ps1"
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✓ Rust installation completed" "Green"
            # Update PATH for current session
            $env:PATH += ";$env:USERPROFILE\.cargo\bin"
            return $true
        } else {
            Write-ColorOutput "✗ Rust installation failed" "Red"
            return $false
        }
    } else {
        Write-ColorOutput "✗ Rust installer script not found" "Red"
        Write-ColorOutput "Please download Rust from: https://rustup.rs/" "Yellow"
        return $false
    }
}

function Build-MSIInstaller {
    Write-ColorOutput "Building MSI installer..." "Yellow"
    
    if (Test-Path ".\build-msi-basic.ps1") {
        Write-ColorOutput "Running MSI build script..." "Cyan"
        
        # Ensure PATH includes required tools
        $env:PATH += ";C:\Program Files\nodejs"
        $env:PATH += ";$env:USERPROFILE\.cargo\bin"
        
        & powershell -ExecutionPolicy Bypass -File ".\build-msi-basic.ps1" -OutputPath $OutputPath
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✓ MSI build completed successfully" "Green"
            return $true
        } else {
            Write-ColorOutput "✗ MSI build failed" "Red"
            return $false
        }
    } else {
        Write-ColorOutput "✗ MSI build script not found" "Red"
        return $false
    }
}

function Show-Summary {
    Write-ColorOutput ""
    Write-ColorOutput "===============================================" "Cyan"
    Write-ColorOutput "MSI Environment Setup Summary" "Cyan"
    Write-ColorOutput "===============================================" "Cyan"
    Write-ColorOutput ""
    
    # Check what was accomplished
    $nodeOK = $false
    $rustOK = $false
    $msiExists = $false
    
    try {
        $env:PATH += ";C:\Program Files\nodejs"
        $nodeVersion = & node --version 2>$null
        if ($nodeVersion) {
            Write-ColorOutput "✓ Node.js: Ready ($nodeVersion)" "Green"
            $nodeOK = $true
        }
    }
    catch { }
    
    try {
        $env:PATH += ";$env:USERPROFILE\.cargo\bin"
        $rustVersion = & rustc --version 2>$null
        if ($rustVersion) {
            Write-ColorOutput "✓ Rust: Ready ($rustVersion)" "Green"
            $rustOK = $true
        }
    }
    catch { }
    
    # Check for MSI files
    if (Test-Path $OutputPath) {
        $msiFiles = Get-ChildItem -Path $OutputPath -Filter "*.msi" -ErrorAction SilentlyContinue
        if ($msiFiles) {
            Write-ColorOutput "✓ MSI Installer: Available" "Green"
            foreach ($msi in $msiFiles) {
                $sizeMB = [math]::Round($msi.Length / 1MB, 2)
                Write-ColorOutput "  • $($msi.Name) ($sizeMB MB)" "White"
            }
            $msiExists = $true
        }
    }
    
    Write-ColorOutput ""
    
    if ($nodeOK -and $rustOK -and $msiExists) {
        Write-ColorOutput "🎉 Everything is ready! Your MSI installer is built and ready to deploy." "Green"
        Write-ColorOutput ""
        Write-ColorOutput "Next steps:" "Yellow"
        Write-ColorOutput "1. Test the MSI installer on a clean Windows machine" "White"
        Write-ColorOutput "2. Use the deployment scripts to distribute the installer" "White"
        Write-ColorOutput "3. See WINDOWS_DEPLOYMENT.md for detailed deployment instructions" "White"
    } elseif ($nodeOK -and $rustOK) {
        Write-ColorOutput "✓ Development environment is ready!" "Green"
        Write-ColorOutput ""
        Write-ColorOutput "To build the MSI installer:" "Yellow"
        Write-ColorOutput "  .\setup-msi-environment.ps1 -BuildMSI" "White"
    } else {
        Write-ColorOutput "⚠ Setup incomplete. Missing components:" "Yellow"
        if (-not $nodeOK) { Write-ColorOutput "  • Node.js - Install from https://nodejs.org/" "White" }
        if (-not $rustOK) { Write-ColorOutput "  • Rust - Run with -InstallRust flag" "White" }
        Write-ColorOutput ""
        Write-ColorOutput "For automatic setup:" "Yellow"
        Write-ColorOutput "  .\setup-msi-environment.ps1 -InstallRust -BuildMSI" "White"
    }
    
    Write-ColorOutput ""
    Write-ColorOutput "Output location: $OutputPath" "Cyan"
}

# Main execution
try {
    Write-ColorOutput "===============================================" "Cyan"
    Write-ColorOutput "Employee Manager MSI Environment Setup" "Cyan"
    Write-ColorOutput "===============================================" "Cyan"
    Write-ColorOutput ""
    
    # Check current state
    $prereqsOK = Test-Prerequisites
    
    Write-ColorOutput ""
    
    # Install Rust if requested and needed
    if ($InstallRust -and -not $prereqsOK) {
        if (-not (Install-RustEnvironment)) {
            Write-ColorOutput "Cannot continue without Rust. Exiting." "Red"
            exit 1
        }
        Write-ColorOutput ""
    }
    
    # Build MSI if requested
    if ($BuildMSI) {
        # Re-check prerequisites after potential Rust installation
        $prereqsOK = Test-Prerequisites
        Write-ColorOutput ""
        
        if ($prereqsOK) {
            Build-MSIInstaller
        } else {
            Write-ColorOutput "Cannot build MSI - prerequisites not met" "Red"
            Write-ColorOutput "Run with -InstallRust to install missing components" "Yellow"
        }
    }
    
    # Show summary
    Show-Summary
}
catch {
    Write-ColorOutput ""
    Write-ColorOutput "===============================================" "Red"
    Write-ColorOutput "Setup Failed!" "Red"
    Write-ColorOutput "===============================================" "Red"
    Write-ColorOutput "Error: $($_.Exception.Message)" "Red"
    Write-ColorOutput ""
    Write-ColorOutput "For help, see: SETUP_MSI_BUILD_ENVIRONMENT.md" "Yellow"
    exit 1
}

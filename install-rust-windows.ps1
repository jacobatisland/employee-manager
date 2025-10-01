# Rust Installation Script for Windows
# This script installs Rust and required components for building Tauri MSI installers

param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuildTools = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Quiet = $false
)

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    if (-not $Quiet) {
        Write-Host $Message -ForegroundColor $Color
    }
}

function Test-AdminRights {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Install-Rust {
    Write-ColorOutput "Installing Rust..." "Yellow"
    
    # Download rustup-init
    $rustupUrl = "https://win.rustup.rs/x86_64"
    $rustupPath = "$env:TEMP\rustup-init.exe"
    
    try {
        Write-ColorOutput "Downloading rustup-init..." "Cyan"
        Invoke-WebRequest -Uri $rustupUrl -OutFile $rustupPath -UseBasicParsing
        
        Write-ColorOutput "Installing Rust (this may take several minutes)..." "Cyan"
        
        # Install Rust with default settings
        $installArgs = @("-y", "--default-toolchain", "stable", "--profile", "default")
        $process = Start-Process -FilePath $rustupPath -ArgumentList $installArgs -Wait -PassThru -NoNewWindow
        
        if ($process.ExitCode -eq 0) {
            Write-ColorOutput "✓ Rust installed successfully!" "Green"
        } else {
            throw "Rust installation failed with exit code $($process.ExitCode)"
        }
        
        # Clean up
        Remove-Item -Path $rustupPath -Force -ErrorAction SilentlyContinue
    }
    catch {
        Write-ColorOutput "✗ Error installing Rust: $($_.Exception.Message)" "Red"
        throw
    }
}

function Update-EnvironmentPath {
    Write-ColorOutput "Updating environment PATH..." "Yellow"
    
    # Add Cargo bin to user PATH
    $cargoPath = "$env:USERPROFILE\.cargo\bin"
    
    if (Test-Path $cargoPath) {
        # Get current user PATH
        $userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
        
        if ($userPath -notlike "*$cargoPath*") {
            $newPath = if ($userPath) { "$userPath;$cargoPath" } else { $cargoPath }
            [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
            Write-ColorOutput "✓ Added Cargo bin to user PATH" "Green"
        } else {
            Write-ColorOutput "✓ Cargo bin already in PATH" "Green"
        }
        
        # Update current session PATH
        $env:PATH += ";$cargoPath"
    }
}

function Install-TauriTarget {
    Write-ColorOutput "Installing Tauri Windows target..." "Yellow"
    
    try {
        # Refresh environment for current session
        $env:PATH += ";$env:USERPROFILE\.cargo\bin"
        
        # Install Windows MSVC target
        & "$env:USERPROFILE\.cargo\bin\rustup.exe" target add x86_64-pc-windows-msvc
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✓ Windows MSVC target installed" "Green"
        } else {
            throw "Failed to install Windows MSVC target"
        }
    }
    catch {
        Write-ColorOutput "✗ Error installing Tauri target: $($_.Exception.Message)" "Red"
        throw
    }
}

function Test-Installation {
    Write-ColorOutput "Verifying installation..." "Yellow"
    
    # Refresh environment
    $env:PATH += ";$env:USERPROFILE\.cargo\bin"
    
    try {
        # Test rustc
        $rustcVersion = & "$env:USERPROFILE\.cargo\bin\rustc.exe" --version
        Write-ColorOutput "✓ rustc: $rustcVersion" "Green"
        
        # Test cargo
        $cargoVersion = & "$env:USERPROFILE\.cargo\bin\cargo.exe" --version
        Write-ColorOutput "✓ cargo: $cargoVersion" "Green"
        
        return $true
    }
    catch {
        Write-ColorOutput "✗ Installation verification failed: $($_.Exception.Message)" "Red"
        return $false
    }
}

function Show-NextSteps {
    Write-ColorOutput ""
    Write-ColorOutput "===============================================" "Green"
    Write-ColorOutput "Rust Installation Completed!" "Green"
    Write-ColorOutput "===============================================" "Green"
    Write-ColorOutput ""
    Write-ColorOutput "Next Steps:" "Yellow"
    Write-ColorOutput "1. Restart your PowerShell/Command Prompt" "White"
    Write-ColorOutput "2. Verify Rust is working: rustc --version" "White"
    Write-ColorOutput "3. Install Tauri CLI: npm install -g @tauri-apps/cli" "White"
    Write-ColorOutput "4. Run the MSI build script: .\build-msi-basic.ps1" "White"
    Write-ColorOutput ""
    Write-ColorOutput "Note: If you encounter build errors, you may need to install" "Yellow"
    Write-ColorOutput "Visual Studio Build Tools with C++ development tools." "Yellow"
    Write-ColorOutput ""
}

# Main execution
try {
    Write-ColorOutput "===============================================" "Cyan"
    Write-ColorOutput "Rust Installation for Tauri MSI Building" "Cyan"
    Write-ColorOutput "===============================================" "Cyan"
    Write-ColorOutput ""
    
    # Check if Rust is already installed
    try {
        $existingRust = & rustc --version 2>$null
        if ($existingRust) {
            Write-ColorOutput "Rust is already installed: $existingRust" "Green"
            Write-ColorOutput "Skipping Rust installation..." "Yellow"
            $skipRustInstall = $true
        }
    }
    catch {
        $skipRustInstall = $false
    }
    
    if (-not $skipRustInstall) {
        # Install Rust
        Install-Rust
        
        # Update PATH
        Update-EnvironmentPath
        
        # Install Windows target
        Install-TauriTarget
    }
    
    # Verify installation
    if (Test-Installation) {
        Show-NextSteps
    } else {
        Write-ColorOutput ""
        Write-ColorOutput "Installation verification failed. Please check the errors above." "Red"
        Write-ColorOutput "You may need to restart your terminal and try again." "Yellow"
        exit 1
    }
}
catch {
    Write-ColorOutput ""
    Write-ColorOutput "===============================================" "Red"
    Write-ColorOutput "Installation Failed!" "Red"
    Write-ColorOutput "===============================================" "Red"
    Write-ColorOutput "Error: $($_.Exception.Message)" "Red"
    Write-ColorOutput ""
    Write-ColorOutput "Troubleshooting:" "Yellow"
    Write-ColorOutput "1. Check your internet connection" "White"
    Write-ColorOutput "2. Run PowerShell as Administrator" "White"
    Write-ColorOutput "3. Temporarily disable antivirus software" "White"
    Write-ColorOutput "4. Check Windows firewall settings" "White"
    exit 1
}

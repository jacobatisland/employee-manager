# Simple MSI Builder for Employee Manager
param(
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = ".\dist\msi"
)

$ErrorActionPreference = "Stop"

Write-Host "Employee Manager MSI Builder" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = & node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js not found" -ForegroundColor Red
    exit 1
}

# Check Rust
try {
    $rustVersion = & rustc --version
    Write-Host "Rust: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Rust not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Building Employee Manager..." -ForegroundColor Yellow

# Navigate to project directory
Set-Location "employee-manager"

# Install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Dependencies installation failed" -ForegroundColor Red
        exit 1
    }
}

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Frontend build failed" -ForegroundColor Red
    exit 1
}

# Build Tauri app with MSI
Write-Host "Building Tauri application with MSI..." -ForegroundColor Yellow
npm run tauri:build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Tauri build failed" -ForegroundColor Red
    exit 1
}

# Go back to root
Set-Location ".."

# Create output directory
New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null

# Copy MSI files
$msiSourcePath = "employee-manager\src-tauri\target\release\bundle\msi"
if (Test-Path $msiSourcePath) {
    $msiFiles = Get-ChildItem -Path $msiSourcePath -Filter "*.msi"
    foreach ($msiFile in $msiFiles) {
        Copy-Item -Path $msiFile.FullName -Destination $OutputPath -Force
        Write-Host "Copied MSI: $($msiFile.Name)" -ForegroundColor Green
    }
} else {
    Write-Host "Warning: MSI directory not found" -ForegroundColor Yellow
}

# Copy executable
$exeSourcePath = "employee-manager\src-tauri\target\release\employee-manager.exe"
if (Test-Path $exeSourcePath) {
    Copy-Item -Path $exeSourcePath -Destination $OutputPath -Force
    Write-Host "Copied executable: employee-manager.exe" -ForegroundColor Green
}

# Copy deployment scripts
$deploymentFiles = @("deploy-windows-client.ps1", "deploy-windows-client.bat")
foreach ($file in $deploymentFiles) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination $OutputPath -Force
        Write-Host "Copied deployment script: $file" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "Output location: $OutputPath" -ForegroundColor White

# List generated files
if (Test-Path $OutputPath) {
    Write-Host ""
    Write-Host "Generated files:" -ForegroundColor Yellow
    $files = Get-ChildItem -Path $OutputPath -File
    foreach ($file in $files) {
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        Write-Host "  $($file.Name) ($sizeMB MB)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "MSI installer is ready for deployment!" -ForegroundColor Green

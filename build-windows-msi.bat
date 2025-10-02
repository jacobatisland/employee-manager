@echo off
REM Employee Management System - Windows MSI Build Script
REM This script builds the Windows MSI installer locally on Windows

echo 🔨 Building Employee Management System - Windows MSI
echo ========================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js (v18+) first.
    pause
    exit /b 1
)

REM Check if Rust is installed
cargo --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Rust is not installed. Please install Rust first.
    echo Visit: https://rustup.rs/
    pause
    exit /b 1
)

REM Check if Tauri CLI is installed
tauri --version >nul 2>&1
if errorlevel 1 (
    echo ℹ️  Installing Tauri CLI...
    npm install -g @tauri-apps/cli
)

echo ✅ Prerequisites check passed

REM Navigate to client directory
cd employee-manager

REM Install dependencies
echo ℹ️  Installing frontend dependencies...
npm ci

echo ✅ Dependencies installed

REM Build frontend
echo ℹ️  Building frontend...
npm run build

echo ✅ Frontend built successfully

REM Add Windows target
echo ℹ️  Adding Windows target...
rustup target add x86_64-pc-windows-msvc

REM Build Tauri app for Windows
echo ℹ️  Building Tauri app for Windows...
npm run tauri build -- --target x86_64-pc-windows-msvc

echo ✅ Tauri app built successfully

REM Check if MSI was created
set MSI_PATH=src-tauri\target\x86_64-pc-windows-msvc\release\bundle\msi
if exist "%MSI_PATH%" (
    for %%f in ("%MSI_PATH%\*.msi") do (
        echo ✅ MSI installer created successfully!
        echo.
        echo 📦 MSI Installer Details:
        echo   File: %%~nxf
        echo   Path: %%~f
        echo   Size: %%~zf bytes
        echo.
        echo 🚀 Installation Instructions:
        echo   1. Run the MSI file as Administrator
        echo   2. Follow the installation wizard
        echo   3. Launch from Start Menu or Desktop shortcut
        echo.
        echo ✅ Windows MSI build completed successfully!
        goto :end
    )
    echo ❌ MSI file not found in %MSI_PATH%
    exit /b 1
) else (
    echo ❌ MSI directory not found: %MSI_PATH%
    exit /b 1
)

:end
pause

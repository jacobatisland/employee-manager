@echo off
REM MSI Setup Launcher - Works from any location
echo ========================================
echo Employee Manager MSI Setup Launcher
echo ========================================
echo.

REM Get the directory where this batch file is located
cd /d "%~dp0"
echo Current directory: %CD%
echo.

REM Check for admin rights
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with Administrator privileges
    echo.
    powershell.exe -ExecutionPolicy Bypass -NoExit -File "%~dp0complete-msi-setup.ps1"
) else (
    echo Requesting Administrator privileges...
    echo.
    powershell.exe -Command "Start-Process cmd.exe -ArgumentList '/c cd /d \"%~dp0\" && powershell.exe -ExecutionPolicy Bypass -NoExit -File \"%~dp0complete-msi-setup.ps1\"' -Verb RunAs"
)

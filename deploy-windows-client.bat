@echo off
REM Employee Manager Windows Client Deployment Batch Script
REM Run as Administrator for system-wide installation

setlocal enabledelayedexpansion

REM Check for required parameters
if "%~1"=="" (
    echo.
    echo ===============================================
    echo Employee Manager Windows Client Deployment
    echo ===============================================
    echo.
    echo Usage: deploy-windows-client.bat ^<server-url^> [msi-path]
    echo.
    echo Examples:
    echo   deploy-windows-client.bat https://your-server.com:3001
    echo   deploy-windows-client.bat https://your-server.com:3001 "Employee Manager_1.0.0_x64_en-US.msi"
    echo.
    echo Please run as Administrator for system-wide installation.
    echo.
    pause
    exit /b 1
)

set SERVER_URL=%~1
set MSI_PATH=%~2
if "%MSI_PATH%"=="" set MSI_PATH=Employee Manager_1.0.0_x64_en-US.msi

echo.
echo ===============================================
echo Employee Manager Windows Client Deployment
echo ===============================================
echo.
echo Server URL: %SERVER_URL%
echo MSI Path: %MSI_PATH%
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo Please right-click and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

REM Check if MSI file exists
if not exist "%MSI_PATH%" (
    echo ERROR: MSI file not found: %MSI_PATH%
    echo Please ensure the MSI file is in the current directory or provide the full path
    echo.
    pause
    exit /b 1
)

REM Create installation directory
echo Creating installation directory...
set INSTALL_PATH=C:\Program Files\Employee Manager
if not exist "%INSTALL_PATH%" mkdir "%INSTALL_PATH%"

REM Install the application
echo Installing Employee Manager...
set LOG_PATH=%TEMP%\EmployeeManager_Install_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.log
set LOG_PATH=%LOG_PATH: =0%

msiexec /i "%MSI_PATH%" /quiet /norestart /l*v "%LOG_PATH%" SERVER_URL=%SERVER_URL% AUTO_CONNECT=true

if %errorLevel% neq 0 (
    echo ERROR: Installation failed with error code %errorLevel%
    echo Check installation log: %LOG_PATH%
    echo.
    pause
    exit /b 1
)

echo Installation completed successfully!

REM Verify installation
set EXE_PATH=%INSTALL_PATH%\Employee Manager.exe
if not exist "%EXE_PATH%" (
    echo ERROR: Application not found after installation
    echo.
    pause
    exit /b 1
)

echo Application installed at: %EXE_PATH%

REM Create desktop shortcut
echo Creating desktop shortcut...
set DESKTOP_PATH=%USERPROFILE%\Desktop
set SHORTCUT_PATH=%DESKTOP_PATH%\Employee Manager.lnk

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = '%EXE_PATH%'; $Shortcut.Arguments = '--server-url=\"%SERVER_URL%\"'; $Shortcut.Description = 'Employee Management System'; $Shortcut.Save()"

if exist "%SHORTCUT_PATH%" (
    echo Desktop shortcut created!
) else (
    echo WARNING: Could not create desktop shortcut
)

REM Create Start Menu shortcut
echo Creating Start Menu shortcut...
set START_MENU_PATH=%APPDATA%\Microsoft\Windows\Start Menu\Programs
set START_SHORTCUT_PATH=%START_MENU_PATH%\Employee Manager.lnk

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%START_SHORTCUT_PATH%'); $Shortcut.TargetPath = '%EXE_PATH%'; $Shortcut.Arguments = '--server-url=\"%SERVER_URL%\"'; $Shortcut.Description = 'Employee Management System'; $Shortcut.Save()"

if exist "%START_SHORTCUT_PATH%" (
    echo Start Menu shortcut created!
) else (
    echo WARNING: Could not create Start Menu shortcut
)

REM Configure Windows Firewall
echo Configuring Windows Firewall...
netsh advfirewall firewall add rule name="Employee Manager Inbound" dir=in program="%EXE_PATH%" action=allow >nul 2>&1
netsh advfirewall firewall add rule name="Employee Manager Outbound" dir=out program="%EXE_PATH%" action=allow >nul 2>&1
echo Firewall rules configured!

REM Create configuration file
echo Creating configuration file...
set CONFIG_PATH=%APPDATA%\Employee Manager
if not exist "%CONFIG_PATH%" mkdir "%CONFIG_PATH%"

echo { > "%CONFIG_PATH%\config.json"
echo   "server": { >> "%CONFIG_PATH%\config.json"
echo     "url": "%SERVER_URL%", >> "%CONFIG_PATH%\config.json"
echo     "timeout": 30000, >> "%CONFIG_PATH%\config.json"
echo     "retries": 3, >> "%CONFIG_PATH%\config.json"
echo     "autoReconnect": true, >> "%CONFIG_PATH%\config.json"
echo     "verifySSL": true >> "%CONFIG_PATH%\config.json"
echo   }, >> "%CONFIG_PATH%\config.json"
echo   "client": { >> "%CONFIG_PATH%\config.json"
echo     "autoRefresh": true, >> "%CONFIG_PATH%\config.json"
echo     "refreshInterval": 5, >> "%CONFIG_PATH%\config.json"
echo     "defaultView": "employees", >> "%CONFIG_PATH%\config.json"
echo     "itemsPerPage": 25 >> "%CONFIG_PATH%\config.json"
echo   } >> "%CONFIG_PATH%\config.json"
echo } >> "%CONFIG_PATH%\config.json"

echo Configuration file created at: %CONFIG_PATH%\config.json

REM Final summary
echo.
echo ===============================================
echo Deployment Summary
echo ===============================================
echo Server URL: %SERVER_URL%
echo Installation Path: %INSTALL_PATH%
echo Configuration Path: %CONFIG_PATH%
echo Desktop Shortcut: %SHORTCUT_PATH%
echo Start Menu Shortcut: %START_SHORTCUT_PATH%
echo Installation Log: %LOG_PATH%
echo.
echo Deployment completed successfully!
echo You can now launch Employee Manager from the desktop or Start Menu.
echo.

REM Ask if user wants to launch the application
set /p LAUNCH="Launch Employee Manager now? (y/N): "
if /i "%LAUNCH%"=="y" (
    echo Launching Employee Manager...
    start "" "%EXE_PATH%"
)

echo.
pause

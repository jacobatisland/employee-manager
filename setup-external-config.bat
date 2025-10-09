@echo off
REM Employee Management System - External Config Setup Script
REM This script helps users set up external configuration for the server URL

echo 🔧 Employee Management System - External Config Setup
echo ==================================================
echo.

REM Get the AppData directory
set "CONFIG_DIR=%APPDATA%\com.employeemanager"
set "OS_NAME=Windows"

echo 📱 Operating System: %OS_NAME%
echo 📁 Config Directory: %CONFIG_DIR%
echo.

REM Create config directory
echo 📂 Creating config directory...
if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"

REM Create config file
set "CONFIG_FILE=%CONFIG_DIR%\config.json"
echo 📄 Creating config file: %CONFIG_FILE%

REM Get server URL from user
echo.
echo 🌐 Enter the server URL (e.g., http://employee-db.se-island.life:4001):
set /p SERVER_URL="Server URL: "

REM Validate server URL
if "%SERVER_URL%"=="" (
    echo ❌ Server URL cannot be empty. Using default.
    set "SERVER_URL=http://employee-db.se-island.life:4001"
)

REM Create the config file
echo {> "%CONFIG_FILE%"
echo   "server_url": "%SERVER_URL%",>> "%CONFIG_FILE%"
echo   "description": "Employee Management System Configuration",>> "%CONFIG_FILE%"
echo   "created": "%date% %time%",>> "%CONFIG_FILE%"
echo   "instructions": {>> "%CONFIG_FILE%"
echo     "note": "This file overrides the app's internal server URL setting",>> "%CONFIG_FILE%"
echo     "restart_required": "Restart the Employee Management System app to apply changes">> "%CONFIG_FILE%"
echo   }>> "%CONFIG_FILE%"
echo }>> "%CONFIG_FILE%"

echo.
echo ✅ Configuration file created successfully!
echo.
echo 📋 Configuration Details:
echo    • Server URL: %SERVER_URL%
echo    • Config File: %CONFIG_FILE%
echo    • Created: %date% %time%
echo.
echo 🚀 Next Steps:
echo    1. Restart the Employee Management System app
echo    2. The app will automatically use the new server URL
echo    3. To change the server URL again, edit: %CONFIG_FILE%
echo.
echo 🔧 Manual Configuration:
echo    You can also manually edit the config file at any time:
echo    %CONFIG_FILE%
echo.
echo 📖 For more information, see: EXTERNAL_CONFIG.md
echo.
pause

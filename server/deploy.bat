@echo off
REM Employee Manager Server - Self-Deployment Script (Windows)
REM This script is included in the server folder for easy deployment

setlocal enabledelayedexpansion

echo 🚀 Employee Manager Server - Self-Deployment
echo ==============================================
echo.

REM Configuration
set PORT=%PORT%
if "%PORT%"=="" set PORT=3001
set NODE_ENV=%NODE_ENV%
if "%NODE_ENV%"=="" set NODE_ENV=production

REM Check if node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js (v18+) first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found. Please run this script from the server directory.
    pause
    exit /b 1
)

REM Install dependencies
echo ℹ️  Installing dependencies...
npm install --production

echo ✅ Dependencies installed

REM Initialize database if it doesn't exist
if not exist "database.sqlite" (
    echo ℹ️  Initializing database...
    npm run init-db
    echo ✅ Database initialized with sample data
) else (
    echo ℹ️  Database already exists, skipping initialization
)

REM Create environment file if it doesn't exist
if not exist ".env" (
    echo ℹ️  Creating environment configuration...
    (
    echo # Employee Manager Server Configuration
    echo PORT=%PORT%
    echo NODE_ENV=%NODE_ENV%
    echo CORS_ORIGIN=*
    echo.
    echo # Database
    echo DB_PATH=./database.sqlite
    echo.
    echo # Logging
    echo LOG_LEVEL=info
    ) > .env
    echo ✅ Environment configuration created
) else (
    echo ℹ️  Environment file already exists
)

REM Create startup script
echo ℹ️  Creating startup script...
(
echo @echo off
echo REM Employee Manager Server Startup Script
echo.
echo REM Load environment variables
echo if exist .env ^(
echo     for /f "usebackq tokens=1,2 delims==" %%a in ^(".env"^) do ^(
echo         if not "%%a"=="" if not "%%a:~0,1%"=="#" set "%%a=%%b"
echo     ^)
echo ^)
echo.
echo REM Start the server
echo echo 🚀 Starting Employee Manager Server...
echo echo Port: %PORT%
echo echo Environment: %NODE_ENV%
echo echo Database: %DB_PATH%
echo echo.
echo.
echo node src/index.js
) > start-server.bat

echo ✅ Startup script created

REM Create stop script
echo ℹ️  Creating stop script...
(
echo @echo off
echo REM Employee Manager Server Stop Script
echo.
echo echo 🛑 Stopping Employee Manager Server...
echo.
echo REM Find and kill the server process
echo for /f "tokens=2" %%i in ^('tasklist /fi "imagename eq node.exe" /fo csv ^| findstr "node.exe"'^) do ^(
echo     taskkill /f /pid %%i
echo ^)
echo.
echo echo Server stopped
) > stop-server.bat

echo ✅ Stop script created

REM Create update script
echo ℹ️  Creating update script...
(
echo @echo off
echo REM Employee Manager Server Update Script
echo.
echo echo 🔄 Updating Employee Manager Server...
echo.
echo REM Check if git is available
echo git --version >nul 2^>^&1
echo if errorlevel 1 ^(
echo     echo ⚠️  Git not available. Please update manually:
echo     echo 1. Download latest server files
echo     echo 2. Replace current files
echo     echo 3. Run: npm install --production
echo ^) else ^(
echo     echo Updating from git repository...
echo     git pull origin master
echo     npm install --production
echo     echo ✅ Server updated successfully
echo ^)
) > update-server.bat

echo ✅ Update script created

REM Display final information
echo.
echo 🎉 Server deployment completed successfully!
echo ==============================================
echo.
echo 📁 Server Directory: %CD%
echo 🌐 Server URL: http://localhost:%PORT%
echo 📊 API Health: http://localhost:%PORT%/api/health
echo 👥 Employees API: http://localhost:%PORT%/api/employees
echo.
echo 🚀 Quick Start Commands:
echo   Start server:    start-server.bat
echo   Stop server:     stop-server.bat
echo   Update server:   update-server.bat
echo.
echo 🔧 Management Commands:
echo   Restart DB:      npm run init-db
echo   Install deps:    npm install
echo.
echo 📋 Configuration:
echo   Edit settings:   notepad .env
echo   Change port:     set PORT=3002 ^&^& start-server.bat
echo   Production:      set NODE_ENV=production ^&^& start-server.bat
echo.

REM Ask if user wants to start the server now
set /p "choice=Do you want to start the server now? (Y/n): "
if /i not "!choice!"=="n" (
    echo ℹ️  Starting server...
    call start-server.bat
) else (
    echo ℹ️  Server ready to start. Run 'start-server.bat' when ready.
)

pause

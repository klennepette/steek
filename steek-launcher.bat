@echo off
REM Steek Launcher for Borduurweelde
REM This script launches the Steek app

REM Get the directory where this script is located
cd /d %~dp0

REM Check if we're in the right directory (steek root)
if not exist package.json (
    echo Error: Could not find Steek installation.
    echo Please ensure this script is in the Steek root directory.
    pause
    exit /b 1
)

echo.
echo Starting Steek...
echo.

REM Check if node_modules exists, if not install dependencies
if not exist node_modules (
    echo Installing dependencies ^(first time only^)...
    call npm install
    if errorlevel 1 (
        echo Error: npm install failed
        pause
        exit /b 1
    )
)

REM Optional: Check for updates
REM Uncomment the line below to auto-update on launch
REM call npm run update-check

REM Start Tauri dev server in background
echo Launching Steek app...
echo.

REM Start the dev server and get its PID
start "Steek Dev Server" npm run tauri dev

REM Wait a few seconds for the app to start
timeout /t 3 /nobreak

REM Open browser to localhost:1420
REM Note: The app will open its own window, this is just a fallback
start http://localhost:1420

REM Keep this window open
pause

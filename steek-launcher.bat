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

REM Launch the app
call npm run tauri dev

if errorlevel 1 (
    echo Error: Failed to start Steek
    pause
    exit /b 1
)

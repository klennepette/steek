@echo off
REM Steek Launcher for Borduurweelde
REM This script launches the Steek app

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Check if we're in the right directory (steek root)
if not exist "%SCRIPT_DIR%package.json" (
    echo Error: Could not find Steek installation.
    echo Please ensure this script is in the Steek root directory.
    pause
    exit /b 1
)

echo Starting Steek...
echo.

REM Check if node_modules exists, if not install dependencies
if not exist "%SCRIPT_DIR%node_modules" (
    echo Installing dependencies (first time only)...
    call npm install
    if !errorlevel! neq 0 (
        echo Error: npm install failed
        pause
        exit /b 1
    )
)

REM Launch the app
call npm run tauri dev

if !errorlevel! neq 0 (
    echo Error: Failed to start Steek
    pause
    exit /b 1
)

endlocal

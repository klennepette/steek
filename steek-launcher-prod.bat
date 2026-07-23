@echo off
REM Steek Launcher - Production Mode
REM This script runs Steek in production mode (pre-built frontend)

cd /d %~dp0

if not exist package.json (
    echo Error: Could not find Steek installation.
    pause
    exit /b 1
)

echo.
echo Starting Steek ^(Production Mode^)...
echo.

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Error: npm install failed
        pause
        exit /b 1
    )
)

if not exist build (
    echo Building frontend...
    call npm run build
    if errorlevel 1 (
        echo Error: build failed
        pause
        exit /b 1
    )
)

echo Launching Steek...
echo.

REM Start the preview server in production mode
start "Steek" npm run tauri dev

REM Wait for app to start
timeout /t 3 /nobreak

REM Open in browser
start http://localhost:1420

pause

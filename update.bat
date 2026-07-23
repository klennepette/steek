@echo off
REM Steek update script for Windows
REM This script updates Steek from source and restarts the app

echo Updating Steek from GitHub...
git pull origin main
if %errorlevel% neq 0 (
    echo Error: git pull failed. Check your internet connection.
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: npm install failed.
    pause
    exit /b 1
)

echo Done! Restart Steek to load the new version.
pause

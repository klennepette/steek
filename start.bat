@echo off
REM Steek Launcher for Windows
cd /d %~dp0

echo.
echo Steek - Borduurweelde
echo.

REM Check Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Fout: Python niet gevonden.
    echo Installeer Python via https://www.python.org/downloads/
    echo Zorg dat "Add Python to PATH" aangevinkt is tijdens de installatie.
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist .venv (
    echo Virtuele omgeving aanmaken...
    python -m venv .venv
)

REM Update from git if available
git status >nul 2>&1
if errorlevel 0 (
    echo Updates controleren...
    git pull --ff-only >nul 2>&1
)

REM Install/update dependencies quietly
echo Afhankelijkheden controleren...
.venv\Scripts\pip install -r requirements.txt -q
if errorlevel 1 (
    echo Fout: installatie van afhankelijkheden mislukt.
    pause
    exit /b 1
)

REM Start the app
.venv\Scripts\python run.py

if errorlevel 1 (
    echo Fout: Steek kon niet starten.
    pause
)

#!/bin/bash
# Steek Launcher for Linux/macOS
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "Steek - Borduurweelde"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Virtuele omgeving aanmaken..."
    python3 -m venv .venv
fi

# Update from git if available
if git status >/dev/null 2>&1; then
    echo "Updates controleren..."
    git pull --ff-only >/dev/null 2>&1 || true
fi

# Install/update dependencies
echo "Afhankelijkheden controleren..."
.venv/bin/pip install -r requirements.txt -q

# Start the app
.venv/bin/python run.py

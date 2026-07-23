#!/bin/bash
# Steek update script for Linux/macOS
# This script updates Steek from source and restarts the app

set -e

echo "Updating Steek from GitHub..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Done! Restart Steek to load the new version."

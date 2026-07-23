#!/bin/bash
# Steek Development Launcher for Linux
# Runs the app in web-only mode (no Tauri/Rust needed)

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if we're in the right directory
if [ ! -f "$SCRIPT_DIR/package.json" ]; then
    echo "Error: Could not find Steek installation."
    echo "Please ensure this script is in the Steek root directory."
    exit 1
fi

cd "$SCRIPT_DIR"

echo ""
echo "Starting Steek (Web Mode - Linux)..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies (first time only)..."
    npm install
fi

# Build the frontend
echo "Building frontend..."
npm run build

# Start preview server and open browser
echo "Launching Steek..."
echo ""

# Start the preview server
npm run preview &
PREVIEW_PID=$!

# Wait for server to start
sleep 3

# Open browser
echo "Opening browser..."
if command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:4173
elif command -v open &> /dev/null; then
    # macOS
    open http://localhost:4173
fi

echo ""
echo "Steek is running at http://localhost:4173"
echo "Press Ctrl+C to stop."
echo ""

# Wait for the preview process
wait $PREVIEW_PID

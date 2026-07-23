# Building and Running Steek

Steek is developed on Linux and runs as a Tauri app with source-code deployment. No binary builds needed.

## Prerequisites

### Linux
```bash
# Ubuntu/Debian
sudo apt-get install curl wget libwebkit2gtk-4.1-dev libssl-dev libgtk-3-dev \
  libayatana-appindicator3-dev librsvg2-dev

# Fedora
sudo dnf install openssl-devel webkit2gtk4.1-devel libappindicator-gtk3-devel \
  librsvg2-devel

# Arch
sudo pacman -S webkit2gtk openssl gcc make
```

### macOS
```bash
xcode-select --install
```

### All Platforms
- **Node.js** (LTS): https://nodejs.org/
- **Rust**: https://www.rust-lang.org/tools/install
- **Git**: https://git-scm.com/

Verify installation:
```bash
node --version
npm --version
rustc --version
git --version
```

## Development (on Linux/macOS)

### Clone the repository
```bash
git clone https://github.com/klennepette/steek.git
cd steek
```

### Install dependencies
```bash
npm install
```

### Run in development mode
```bash
npm run tauri dev
```

The app opens in a window. Edit source files in `src/` and they'll reload automatically (hot reload).

## Running on Windows

### Option 1: Development Mode (Recommended for Testing)
Double-click `steek-launcher.bat`:
- Hot reload enabled
- Perfect for testing changes
- Slightly slower startup

### Option 2: Production Mode (Recommended for Daily Use)
Double-click `steek-launcher-prod.bat`:
- Pre-built frontend (faster startup)
- More stable
- Better for end-users

Both launchers:
- Auto-install dependencies on first run
- Open browser to `http://localhost:1420`
- Create a terminal window for logs

### Create Desktop Shortcut (Windows)

1. Open PowerShell as Administrator
2. Navigate to the steek folder
3. Run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
   .\create-shortcut.ps1
   ```

This creates a "Steek" shortcut on your Desktop (uses production launcher).

## Scripts

### Development
```bash
npm run tauri dev          # Start dev server with hot reload
npm run build              # Build frontend only
```

### Production
```bash
npm run build              # Pre-build frontend
npm run serve              # Run preview server
```

### Other
```bash
npm run check              # Type check with SvelteKit
npm run check:watch        # Watch mode type checking
```

## Updating

### Linux/macOS
```bash
./update.sh
```

### Windows
```bash
update.bat
```

This pulls the latest code from GitHub and reinstalls dependencies.

## Creating a Release

1. Update version in:
   - `src-tauri/tauri.conf.json` → `"version"`
   - `package.json` → `"version"`

2. Commit and push:
   ```bash
   git add .
   git commit -m "chore: bump version to X.Y.Z"
   git push origin main
   ```

3. Create GitHub Release:
   - Go to https://github.com/klennepette/steek/releases
   - Click "Draft a new release"
   - Tag: `vX.Y.Z` (e.g., `v0.1.0`)
   - Title: `vX.Y.Z - Description`
   - Description: Release notes
   - Click "Publish release"

Users can now access the new version via:
```bash
git pull origin main
npm install
npm run tauri dev
```

## Troubleshooting

### Linux: WebKit2 Library Not Found
Install development packages for your distribution (see Prerequisites above).

### Windows: "cargo" not found
Rust is not installed or PATH wasn't updated:
1. Install Rust: https://www.rust-lang.org/tools/install
2. Restart your terminal/computer
3. Verify: `cargo --version`

### Windows: "npm" not found
Node.js is not installed:
1. Install Node.js (LTS): https://nodejs.org/
2. Restart your terminal
3. Verify: `npm --version`

### Port 1420 in use
Another app or instance of Steek is using port 1420:
- Close the other instance
- Or edit `vite.config.js` and change the port number

### Dependencies error
Clear and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build fails
Check for TypeScript errors:
```bash
npm run check
```

Fix errors and try again.

## Environment

- **OS:** Linux (development), Windows/macOS (production)
- **Node:** v18+ (LTS recommended)
- **Rust:** 1.70+
- **Database:** SQLite 3.x

## Performance

- Dev mode startup: ~3-5 seconds (first run with dependencies)
- Prod mode startup: ~1-2 seconds (after first build)
- Hot reload: ~500ms
- Database: SQLite handles ~10k+ products efficiently

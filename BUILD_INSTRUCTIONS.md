# Building and Running Steek

Steek is developed on Linux and runs as a Tauri app with source-code deployment. No binary builds.

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
# Xcode command-line tools
xcode-select --install
```

### All platforms
- **Node.js** (LTS): https://nodejs.org/
- **Rust**: https://www.rust-lang.org/tools/install
- **Git**: https://git-scm.com/

Verify:
```bash
node --version
npm --version
rustc --version
git --version
```

## Development (on Linux)

### Clone the repo
```bash
git clone https://github.com/klennepette/steek.git
cd steek
```

### Install and run
```bash
npm install
npm run tauri dev
```

The app opens in a dev window. Edit source files, save → auto-reloads.

## Deployment (source code)

### For Windows/macOS users

1. **Clone or update**
   ```bash
   git clone https://github.com/klennepette/steek.git
   cd steek
   ```
   (or `git pull origin main` if already cloned)

2. **Install and run**
   ```bash
   npm install
   npm run tauri dev
   ```

### Auto-update (manual)

On Windows, run:
```bash
update.bat
```

On Linux/macOS:
```bash
./update.sh
```

This pulls the latest code and reinstalls dependencies.

## Creating a Release

1. Update version in `src-tauri/tauri.conf.json` and `package.json`
2. Commit and push
3. Create a GitHub release:
   - Go to https://github.com/klennepette/steek/releases
   - Click "Draft a new release"
   - Tag: `v0.1.0` (matches version in config)
   - Title: `v0.1.0 - Release notes here`
   - Publish

The release is now available as source code on GitHub.

## Troubleshooting

- **Rust errors**: `rustup update`
- **Node errors**: `rm -rf node_modules package-lock.json && npm install`
- **Webkit2 missing (Linux)**: Install development packages (see prerequisites)
- **Port 1420 in use**: Kill the process or change port in `vite.config.js`

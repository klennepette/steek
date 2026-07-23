# Building Steek for Windows

These instructions are for building the `.exe` installer on Windows.

## Prerequisites

Ensure you have installed:
- **Node.js** (LTS): https://nodejs.org/
- **Rust**: https://www.rust-lang.org/tools/install
- **Git**: https://git-scm.com/download/win

Verify in a terminal:
```bash
node --version
npm --version
rustc --version
git --version
```

## Build Steps

1. **Clone or pull the latest code**
   ```bash
   cd steek
   git pull origin main
   ```

2. **Install dependencies** (first time only)
   ```bash
   npm install
   ```

3. **Build the application**
   ```bash
   npm run tauri build
   ```

   This will take 5–10 minutes on first build. Watch for any errors.

## Output

The built `.exe` installer will be at:
```
src-tauri/target/release/bundle/nsis/Steek_0.1.0_x64-setup.exe
```

You can also find an MSI installer at:
```
src-tauri/target/release/bundle/msi/Steek_0.1.0_x64.msi
```

## Testing the Build

1. Run the installer (`.exe`)
2. Install Steek to a folder
3. Launch Steek from the Start menu
4. Test the app (Kassa, Voorraad, etc.)

## Creating a GitHub Release

Once you've verified the build works:

1. Go to https://github.com/klennepette/steek/releases
2. Click **"Draft a new release"**
3. Enter tag: `v0.1.0` (must match version in `tauri.conf.json`)
4. Title: `v0.1.0 - First Release`
5. Upload the `.exe` file from `src-tauri/target/release/bundle/nsis/`
6. Publish

The auto-updater will then fetch releases from this page.

## Troubleshooting

- **Rust compiler errors**: Run `rustup update`
- **Node errors**: Delete `node_modules/` and `package-lock.json`, then `npm install`
- **Permission denied on Windows**: Run terminal as Administrator

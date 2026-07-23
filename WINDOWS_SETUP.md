# Windows Setup Guide - Steek

This guide walks you through setting up and running Steek on Windows.

## Prerequisites

Before starting, ensure you have:

1. **Git** — https://git-scm.com/download/win
2. **Node.js (LTS)** — https://nodejs.org/
3. **Rust** — https://www.rust-lang.org/tools/install

After installing each, restart your terminal/computer to update PATH.

Verify all are installed:
```bash
git --version
node --version
npm --version
rustc --version
cargo --version
```

If any command is "not found", the tool isn't installed or PATH wasn't updated.

## Step 1: Get Steek

Clone the repository to a folder (e.g., `C:\Users\YourName\steek`):

```bash
git clone https://github.com/klennepette/steek.git
cd steek
```

## Step 2: Create Desktop Shortcut

### Automated (Recommended)

1. Open **PowerShell as Administrator**
   - Right-click the PowerShell icon → "Run as Administrator"

2. Navigate to the Steek folder:
   ```powershell
   cd C:\path\to\steek
   ```

3. Allow script execution and run the shortcut creator:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
   .\create-shortcut.ps1
   ```

   A desktop explorer window opens showing your new "Steek" shortcut.

### Manual (Alternative)

1. Right-click `steek-launcher-prod.bat` → "Create shortcut"
2. Drag the shortcut to your Desktop
3. (Optional) Right-click the shortcut → Properties → "Change Icon"
   - Browse to `steek-logo.ico` if you've created it

## Step 3: Launch Steek

**Double-click the "Steek" shortcut on your Desktop**

First run:
- A terminal window opens
- Dependencies install (~2-3 minutes)
- "Launching Steek..." message appears
- Browser opens to `http://localhost:1420`
- The Steek app window appears

Subsequent runs:
- Instant startup (takes ~1-2 seconds)
- Browser opens automatically
- Start using the app

## Running Steek Without Shortcut

You can also launch Steek directly:

### Production Mode (Faster, Recommended)
```bash
cd C:\path\to\steek
steek-launcher-prod.bat
```

### Development Mode (Hot Reload for Testing)
```bash
cd C:\path\to\steek
steek-launcher.bat
```

## Using the App

### Kassa (Checkout)
1. Scan barcode or packetcode
2. Select product from results (if needed)
3. Adjust quantity with +/−
4. Select payment method (Contant/Payconiq/Gemengd)
5. Click "Afrekenen" to complete sale

### Voorraad (Inventory)
1. Click "+ Nieuw product" to add items
2. Fill in:
   - Naam (product name)
   - Barcode (optional)
   - Pakketcode (optional)
   - Prijs (price)
   - Voorraad (stock quantity)
3. Click "Opslaan"
4. Search/filter products by name or code

### Verkopen (Sales History)
1. Select date range with "Van" and "Tot"
2. Click "Toon" to load sales
3. Click a sale row to see details
4. View dagtotaal (day total) at bottom

### Instellingen (Settings)
- Configure shop name and printer
- Check for updates manually

## Updating Steek

To get the latest version:

1. Open terminal in the Steek folder
2. Run:
   ```bash
   update.bat
   ```
3. Close and relaunch Steek

Or manually:
```bash
cd C:\path\to\steek
git pull origin main
npm install
```

## Optional: Add Custom Icon

The desktop shortcut looks for `steek-logo.ico`. To add a custom icon:

1. Convert the SVG logo to ICO format:
   - Use https://convertio.co/svg-ico/
   - Upload `steek-logo.svg`
   - Download as `.ico`

2. Save the `.ico` file in the Steek folder as `steek-logo.ico`

3. Re-run the shortcut creator:
   ```powershell
   .\create-shortcut.ps1
   ```

The icon will now appear on your desktop shortcut.

## Troubleshooting

### "npm is not recognized"
- Node.js is not installed or PATH wasn't updated
- Install from https://nodejs.org/
- Restart your computer

### "git is not recognized"
- Git is not installed
- Install from https://git-scm.com/download/win
- Restart your computer

### "cargo not found"
- Rust is not installed or PATH wasn't updated
- Install from https://www.rust-lang.org/tools/install
- Restart your terminal and computer

### PowerShell execution policy error
- Run: `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser`
- Then retry: `.\create-shortcut.ps1`

### "Port 1420 already in use"
- Another Steek instance is running
- Close the other window
- Or restart your computer

### Dependencies not installing
- Open terminal in Steek folder
- Run: `npm install`
- If still failing: delete `node_modules` folder and try again

### App won't start
- Check that all prerequisites are installed (see top of this guide)
- Try running from terminal:
  ```bash
  cd C:\path\to\steek
  npm run tauri dev
  ```
- Look for error messages in the terminal

### Browser doesn't open automatically
- You can manually navigate to http://localhost:1420
- Or click the terminal window to see if the app is running

## Getting Help

- Check [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md) for more technical details
- Check [README.md](README.md) for overview
- Report issues: https://github.com/klennepette/steek/issues

## Next Steps

- **Add products** in Voorraad
- **Process a test sale** in Kassa
- **Check sales history** in Verkopen
- **Configure settings** in Instellingen

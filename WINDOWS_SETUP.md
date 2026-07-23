# Windows Setup - Create Steek Desktop Shortcut

## One-time Setup

### 1. Clone/Extract Steek

Clone the repository to a folder (e.g., `C:\Users\YourName\steek`):

```bash
git clone https://github.com/klennepette/steek.git
cd steek
```

### 2. Create Desktop Shortcut

**Option A: Automated (Recommended)**

1. Open PowerShell as Administrator
   - Right-click PowerShell → "Run as Administrator"

2. Navigate to the Steek folder:
   ```powershell
   cd C:\path\to\steek
   ```

3. Run the shortcut creator:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
   .\create-shortcut.ps1
   ```

   This creates a "Steek.lnk" shortcut on your Desktop.

**Option B: Manual**

1. Right-click on `steek-launcher.bat` → "Create shortcut"
2. Drag the shortcut to your Desktop
3. Right-click the shortcut → Properties
4. Change the icon:
   - Advanced → select "Run as administrator"
   - Change Icon button (if available)
   - Browse to `steek-logo.ico` (once created)

### 3. Add Custom Icon (Optional)

To convert the SVG logo to Windows .ico format:

1. Use an online converter: https://convertio.co/svg-ico/
   - Upload `steek-logo.svg`
   - Download as `.ico`

2. Place the `.ico` file in the steek folder as `steek-logo.ico`

3. Re-run the shortcut creator (Option A) or manually update the icon

## Launching Steek

### Standard Launch (Development Mode)
1. **Double-click the "Steek" shortcut on your Desktop**
2. A terminal opens and dependencies install (first time only)
3. The app launches with the Tauri dev server
4. Browser opens to http://localhost:1420

### Production Mode (Optional)
For a faster, more stable launch without dev server overhead:

1. In the Steek folder, double-click `steek-launcher-prod.bat`
2. First run will build the frontend, then launch
3. Subsequent runs start instantly
4. Browser opens automatically

**Recommendation:** Use the standard launcher for development. Use production launcher for daily use after initial setup.

## Updates

To update Steek:
- Run `update.bat` in the Steek folder
- Close and relaunch Steek

## Troubleshooting

**"npm is not recognized"**
- Node.js is not installed
- Install from https://nodejs.org/ (LTS version)
- Restart your computer

**"Command not found"**
- PowerShell execution policy blocked the script
- Run: `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser`

**Port 1420 already in use**
- Another app is using the port
- Close other Steek instances or restart your computer

**Dependencies not installing**
- Delete `node_modules` folder
- Open terminal in steek folder
- Run `npm install`

# Create Windows Desktop Shortcut for Steek
# Run this script in PowerShell as Administrator

param(
    [string]$SteekPath = (Split-Path -Parent $MyInvocation.MyCommand.Path)
)

Write-Host "Creating Steek desktop shortcut..." -ForegroundColor Green

# Validate that Steek installation exists
if (-not (Test-Path "$SteekPath\package.json")) {
    Write-Host "Error: Could not find Steek installation at $SteekPath" -ForegroundColor Red
    Write-Host "Usage: .\create-shortcut.ps1 -SteekPath C:\path\to\steek" -ForegroundColor Yellow
    exit 1
}

# Launcher script path
$LauncherPath = "$SteekPath\steek-launcher.bat"

# Desktop path
$DesktopPath = [Environment]::GetFolderPath("Desktop")

# Create shortcut
$ShortcutPath = "$DesktopPath\Steek.lnk"
$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut($ShortcutPath)

# Configure shortcut
$Shortcut.TargetPath = "cmd.exe"
$Shortcut.Arguments = "/c `"$LauncherPath`""
$Shortcut.WorkingDirectory = $SteekPath
$Shortcut.WindowStyle = 1  # Normal window
$Shortcut.Description = "Steek - Borduurweelde Inventory & POS"

# Try to set icon (requires ImageMagick or custom .ico file)
# For now, we'll try to use the SVG via a Windows shortcut
# This requires converting SVG to ICO first

$IconPath = "$SteekPath\steek-logo.ico"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = "$IconPath,0"
    Write-Host "Icon set from: $IconPath" -ForegroundColor Cyan
} else {
    Write-Host "Note: Icon file not found at $IconPath" -ForegroundColor Yellow
    Write-Host "To add a custom icon, convert steek-logo.svg to .ico format" -ForegroundColor Yellow
}

# Save shortcut
$Shortcut.Save()

Write-Host "✓ Shortcut created: $ShortcutPath" -ForegroundColor Green
Write-Host "You can now launch Steek from your desktop!" -ForegroundColor Green

# Open Desktop folder to show the shortcut
explorer $DesktopPath

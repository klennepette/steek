# Create Windows Desktop Shortcut for Steek
# Run this script in PowerShell as Administrator

param(
    [string]$SteekPath = (Split-Path -Parent $MyInvocation.MyCommand.Path)
)

Write-Host "Creating Steek desktop shortcut..."

# Validate that Steek installation exists
if (-not (Test-Path "$SteekPath\package.json")) {
    Write-Host "Error: Could not find Steek installation at $SteekPath"
    Write-Host "Usage: .\create-shortcut.ps1 -SteekPath C:\path\to\steek"
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
$Shortcut.Arguments = "/c ""$LauncherPath"""
$Shortcut.WorkingDirectory = $SteekPath
$Shortcut.WindowStyle = 1
$Shortcut.Description = "Steek - Borduurweelde Inventory & POS"

# Try to set icon
$IconPath = "$SteekPath\steek-logo.ico"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = "$IconPath,0"
    Write-Host "Icon set from: $IconPath"
} else {
    Write-Host "Note: Icon file not found at $IconPath"
    Write-Host "To add a custom icon, convert steek-logo.svg to .ico format"
}

# Save shortcut
$Shortcut.Save()

Write-Host "Shortcut created: $ShortcutPath"
Write-Host "You can now launch Steek from your desktop!"

# Open Desktop folder to show the shortcut
explorer $DesktopPath

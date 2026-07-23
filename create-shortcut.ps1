# Create Windows Desktop Shortcut for Steek
# Run this script in PowerShell

param(
    [string]$SteekPath = (Split-Path -Parent $MyInvocation.MyCommand.Path)
)

Write-Host "Creating Steek desktop shortcut..."

if (-not (Test-Path "$SteekPath\run.py")) {
    Write-Host "Error: Could not find Steek installation at $SteekPath"
    exit 1
}

$LauncherPath = "$SteekPath\start.bat"
$DesktopPath  = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = "$DesktopPath\Steek.lnk"

$Shell    = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut($ShortcutPath)

$Shortcut.TargetPath      = "cmd.exe"
$Shortcut.Arguments       = "/c ""$LauncherPath"""
$Shortcut.WorkingDirectory = $SteekPath
$Shortcut.WindowStyle     = 1
$Shortcut.Description     = "Steek - Borduurweelde Inventory & POS"

$IconPath = "$SteekPath\steek-logo.ico"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = "$IconPath,0"
    Write-Host "Icon set from: $IconPath"
}

$Shortcut.Save()

Write-Host "Shortcut created: $ShortcutPath"
Write-Host "You can now launch Steek from your desktop!"

explorer $DesktopPath

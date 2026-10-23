/**
 * Windows Desktop App Generator & Deployment Utility
 * Provides native Windows batch launchers, PowerShell shortcut installers,
 * and Electron standalone package files for OMEGA Master Orchestrator.
 */

export interface WindowsLauncherConfig {
  appUrl: string;
  appName: string;
  version: string;
}

/**
 * Generates a native Windows .bat script that launches the app in borderless
 * standalone app mode using Microsoft Edge or Google Chrome.
 */
export function generateWindowsBatchLauncher(config: WindowsLauncherConfig): string {
  const url = config.appUrl || window.location.origin;
  return `@echo off
:: ============================================================================
:: OMEGA MASTER ORCHESTRATOR - WINDOWS DESKTOP LAUNCHER
:: Version: ${config.version}
:: Starts OMEGA in native standalone window mode (No browser address bar/tabs)
:: ============================================================================
title Starting OMEGA Master Orchestrator...
color 0b

echo.
echo  ==============================================================
echo    OMEGA MASTER ORCHESTRATOR - WINDOWS DESKTOP RUNTIME
echo  ==============================================================
echo.
echo  [SYSTEM] Checking installed browser engines...

set "TARGET_URL=${url}"
set "APP_DATA_DIR=%LOCALAPPDATA%\\OMEGA_Desktop_App"

if not exist "%APP_DATA_DIR%" mkdir "%APP_DATA_DIR%"

:: 1. Check for Microsoft Edge (Standard on Windows 10 and Windows 11)
set "EDGE_EXE="
if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    set "EDGE_EXE=%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe"
) else if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    set "EDGE_EXE=%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe"
) else if exist "%LOCALAPPDATA%\\Microsoft\\Edge\\Application\\msedge.exe" (
    set "EDGE_EXE=%LOCALAPPDATA%\\Microsoft\\Edge\\Application\\msedge.exe"
)

:: 2. Check for Google Chrome fallback
set "CHROME_EXE="
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    set "CHROME_EXE=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe"
) else if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" (
    set "CHROME_EXE=%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe"
) else if exist "%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe" (
    set "CHROME_EXE=%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe"
)

:: 3. Launch in Desktop App Mode
if defined EDGE_EXE (
    echo  [OK] Launching via Microsoft Edge Standalone Desktop Window...
    start "" "%EDGE_EXE%" --app="%TARGET_URL%" --window-size=1440,920 --user-data-dir="%APP_DATA_DIR%"
    goto :Done
)

if defined CHROME_EXE (
    echo  [OK] Launching via Google Chrome Standalone Desktop Window...
    start "" "%CHROME_EXE%" --app="%TARGET_URL%" --window-size=1440,920 --user-data-dir="%APP_DATA_DIR%"
    goto :Done
)

:: 4. Fallback to default browser
echo  [WARN] Native Chromium engine not located at standard path.
echo  [INFO] Opening default browser window...
start "" "%TARGET_URL%"

:Done
echo  [READY] OMEGA Desktop App Session initialized.
timeout /t 2 >nul
exit /b 0
`;
}

/**
 * Generates a PowerShell script that creates a Windows Desktop shortcut (.lnk)
 */
export function generateWindowsPowerShellShortcut(config: WindowsLauncherConfig): string {
  const url = config.appUrl || window.location.origin;
  return `# ============================================================================
# OMEGA Master Orchestrator - Windows Desktop Shortcut Installer
# Creates a native Desktop & Start Menu shortcut for OMEGA
# ============================================================================

$AppName = "${config.appName}"
$TargetUrl = "${url}"
$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "$AppName.lnk"

# Locate Edge or Chrome
$EdgePath = "\${env:ProgramFiles(x86)}\\Microsoft\\Edge\\Application\\msedge.exe"
if (-not (Test-Path $EdgePath)) {
    $EdgePath = "\$env:ProgramFiles\\Microsoft\\Edge\\Application\\msedge.exe"
}

$BrowserPath = $EdgePath
if (-not (Test-Path $BrowserPath)) {
    $BrowserPath = "\$env:ProgramFiles\\Google\\Chrome\\Application\\chrome.exe"
}

Write-Host "Creating Windows Desktop Shortcut for $AppName..." -ForegroundColor Cyan

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
if (Test-Path $BrowserPath) {
    $Shortcut.TargetPath = $BrowserPath
    $Shortcut.Arguments = "--app=$TargetUrl --window-size=1440,920"
} else {
    $Shortcut.TargetPath = $TargetUrl
}

$Shortcut.Description = "Adversarial Swarm Stresstest & Deterministischer Slop-Sanitizer"
$Shortcut.WindowStyle = 1
$Shortcut.Save()

Write-Host "[SUCCESS] Shortcut created at: $ShortcutPath" -ForegroundColor Green
Write-Host "You can now launch OMEGA directly from your Windows Desktop!" -ForegroundColor Yellow
`;
}

/**
 * Generates an Electron main process script (electron-main.cjs)
 * for packaging into a standalone Windows .exe
 */
export function generateElectronMainCjs(config: WindowsLauncherConfig): string {
  const url = config.appUrl || 'http://localhost:3000';
  return `// ============================================================================
// OMEGA Master Orchestrator - Standalone Windows Electron Main Process
// ============================================================================
const { app, BrowserWindow, shell, ipcMain, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#090d16',
    title: 'OMEGA Master Orchestrator - Windows Desktop',
    icon: path.join(__dirname, 'public/icon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    autoHideMenuBar: true,
    frame: true, // Native Windows titlebar and window controls
  });

  // Load production URL or local server
  const startUrl = process.env.ELECTRON_START_URL || '${url}';
  mainWindow.loadURL(startUrl);

  // External links open in the user's default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
`;
}

/**
 * Downloads a file to the user's computer via browser blob
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

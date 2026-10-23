// ============================================================================
// OMEGA Master Orchestrator - Standalone Windows Electron Desktop Application
// Version: 3.0.0
// ============================================================================
const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#090d16',
    title: 'OMEGA Master Orchestrator - Windows Desktop App',
    icon: path.join(__dirname, 'public/icon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    autoHideMenuBar: true,
    frame: true, // Native Windows Titlebar with minimize, maximize, and close
  });

  const startUrl = process.env.ELECTRON_START_URL || 'https://ais-dev-nr6p3xkvtusnaosqhzh73l-290704346206.europe-west2.run.app';
  mainWindow.loadURL(startUrl);

  // Open external links in user's default browser (Edge / Chrome / Firefox)
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

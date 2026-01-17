import { app, BrowserWindow, globalShortcut } from 'electron';
import * as path from 'path';

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        kiosk: process.env.NODE_ENV === 'production', // Kiosk mode only in production by default or toggleable
        fullscreen: process.env.NODE_ENV === 'production', // Fullscreen in production
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        autoHideMenuBar: true,
        title: 'Burgos Reception',
        // icon: path.join(__dirname, '../assets/icon.png')
    });

    // Development: Load local Next.js instance
    // Production: Load built files or production URL
    // TODO: Change this URL to your deployed "online" URL (e.g., https://burgos.vercel.app/reception)
    const startUrl = process.env.ELECTRON_START_URL || 'https://burgos.paulomoraes.cloud/reception';

    console.log('Loading URL:', startUrl);
    win.loadURL(startUrl);

    // Global shortcut to quit (critical for Kiosk mode safety)
    globalShortcut.register('CommandOrControl+Shift+Q', () => {
        app.quit();
    });

    // Open DevTools in dev mode
    if (process.env.NODE_ENV !== 'production') {
        // win.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

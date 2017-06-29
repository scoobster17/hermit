// dependencies
const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let appWindow;

function createWindow() {

    appWindow = new BrowserWindow({
        height: 600,
        width: 800
    });

    appWindow.loadURL(url.format({
        pathname: path.join(__dirname, '..', 'app', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    appWindow.on('closed', () => {
        appWindow = null;
    });

}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (appWindow === null) {
        createWindow();
    }
});
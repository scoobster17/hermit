// dependencies
const { app, BrowserWindow } = require('electron');
const server = require('../server/index.js');

const path = require('path');
const url = require('url');

let appWindow;

function createBrowserWindow() {

    appWindow = new BrowserWindow({
        height: 600,
        width: 900
    });

    appWindow.loadURL('http://localhost:6378');

    appWindow.on('closed', () => {
        appWindow = null;
    });

}

app.on('ready', createBrowserWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (appWindow === null) {
        createBrowserWindow();
    }
});
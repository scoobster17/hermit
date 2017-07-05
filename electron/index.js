/******************************************************************************/

/**
 * Electron configuration file for Hermit Shell Browser tabs app
 * @author Phil Gibbins (@Scoobster17)
 */

/******************************************************************************/

/**
 * DEPENDENCIES
 */

// utilities
const path = require('path');

// electron
const { app, BrowserWindow } = require('electron');

// http server
const server = require('../server/index.js');

/******************************************************************************/

/**
 * VARIABLES
 */

// Global reference of window object so not closed automatically when garbage
// collected
let appWindow;

/******************************************************************************/

/**
 * FUNCTIONS
 */

/**
 * Create a browser window in the electron app, loading the app from the local
 * HTTP server
 */
const createBrowserWindow = () => {
    appWindow = new BrowserWindow({
        height: 600,
        width: 900
    });
    appWindow.loadURL('http://localhost:6378');

    // when the window is closed, remove the global reference to the window
    appWindow.on('closed', () => {
        appWindow = null;
    });
};

/******************************************************************************/

/**
 * EVENTS
 */

/**
 * Create a browser window when Electron has finished initialising
 */
app.on('ready', createBrowserWindow);

/**
 * Quit when all windows are closed, unless on Mac as default behaviour is for
 * the user to manually quit either using menu bar or Cmd + Q
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/**
 * Re-create a widow in the app when the dock icon is clicked and there are no
 * other windows open (default Mac behaviour)
 */
app.on('activate', () => {
    if (appWindow === null) {
        createBrowserWindow();
    }
});

/******************************************************************************/

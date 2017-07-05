/******************************************************************************/

/**
 * Server configuration file for Hermit Shell Browser tabs app
 * @author Phil Gibbins (@Scoobster17)
 */

/******************************************************************************/

/**
 * DEPENDENCIES
 */

// utilities
const fs = require("fs");
const path = require("path");
const recursive = require('recursive-readdir');
const readMultipleFiles = require('read-multiple-files');

// framework
const express = require("express");
const bodyParser = require('body-parser');

/******************************************************************************/

/**
 * SETUP
 * Setting up and configuring Express App
 */
const expressApp = express();
expressApp.use( express.static(__dirname + '/../app'));
expressApp.use( bodyParser.urlencoded({ extended: false }));
expressApp.use( bodyParser.json() );
expressApp.listen(6378);

/******************************************************************************/

/**
 * VARIABLES
 */
const pluginsDirectory = __dirname + '/../data/plugins';
const settingsPath = __dirname + '/../data/user/';
const settingsFile = 'settings.json';
const isErrorFileOrDirMissing = err => err.code === 'ENOENT' && err.errno === -2;

/******************************************************************************/

/**
 * ROUTING
 */

/**
 * Get the configurations for all supported plugins and concatenate them into
 * one array which then then be rendered on the front end to pre-fill the new
 * tab form
 * @return {Object} [Object containing JSON array configuration file contents]
 */
expressApp.get('/pre-configured-tabs', (req, res) => {

    // recursively search the plugins folder for all config.json files. Images
    // and mac dot files are ignored as these cannot be parsed (2nd param).
    // Results are gathered into an array of file names with their paths.
    recursive(
        pluginsDirectory,
        [
            '**/*.png',
            '**/*.svg',
            '**/*.jpg',
            '**/.DS_Store'
        ],
        (err, files) => {
            if (err) throw err;

            // read each file returned by the search and collect them all into
            // an array of configuration objects
            readMultipleFiles(files, 'utf-8', (err, results) => {
                if (err) throw err;
                res.status(200).send(
                    results.map(fileContents => JSON.parse(fileContents))
                );
            }
        );
    })
});

/**
 * Get the user's local settings from a local configuration file. This file
 * stores the configurations that have been set up on the device where the app
 * is running.
 * @return {Object} Object containing JSON Array of local site configurations
 */
expressApp.get('/user/settings/get', (req, res) => {
    fs.readFile(settingsPath + settingsFile, 'utf-8', (err, data) => {
        if (err) {

            // if the directory where the user's configuration is stored does
            // not exist, or the directory does and the file itself does not,
            // return a success state as there is simply no configuration to
            // return, otherwise, throw an error as normal
            if (isErrorFileOrDirMissing(err)) {
                res.status(200).send({ success: true, data: null });
            } else {
                throw err;
            }
        } else {
            res.status(200).send({ success: true, data });
        }
    });
});

/**
 * Store a site configuration by adding to the local user configuration file
 * @return {Object} Object containing success state
 */
expressApp.post('/user/settings/set', (req, res) => {
    fs.readFile(settingsPath + settingsFile, 'utf-8', (err, data) => {
        if (err) {

            // if the directory where the user's configuration is stored does
            // not exist, or the directory does and the file itself does not
            if (isErrorFileOrDirMissing(err)) {

                // check if the directory exists, and if not, create it
                if (!fs.existsSync(settingsPath)) fs.mkdirSync(settingsPath);

                // create the configuration file and write the contents of the
                // configuration passed
                fs.writeFile(
                    settingsPath + settingsFile,
                    JSON.stringify([req.body]),
                    (writeErr) => {
                        if (writeErr) throw writeErr;
                        res.status(500).send({ success: false }); // 500?
                    }
                );
            } else {
                res.status(500).send({ success: false }); // 500?
            }

        // if the configuration file already exists, add the configuration
        // passed to the array of configurations in the file already
        } else {
            const newSettings = JSON.parse(data);
            newSettings.push(req.body);
            fs.writeFile(
                settingsPath + settingsFile,
                JSON.stringify(newSettings),
                (err) => { if (err) throw err; }
            );
            res.status(200).send({ success: true });
        }
    });
});

/**
 * Intercept image requests as each plugin's image is located separately in it's
 * corresponding plugin file. Serve the file from the required folder.
 */
expressApp.get('/img/service/*', (req, res) => {
    const file = req.url.replace('/img/service', pluginsDirectory);
    res.status(200).sendFile( path.resolve(file) );
});

// dependencies
var fs = require("fs");
var path = require("path");
var express = require("express");
var bodyParser = require('body-parser');
var recursive = require('recursive-readdir');
var readMultipleFiles = require('read-multiple-files');

// set up express app
var expressApp = express();

// set up express
expressApp.use(express.static(__dirname + '/../app'));
expressApp.use( bodyParser.urlencoded({ extended: false }) );
expressApp.use( bodyParser.json() );

// routing
expressApp.get('/', function(req,res) {
  res.sendFile(path.join(__dirname+'/../app/index.html'));
});

expressApp.get('/pre-configured-tabs', function(req,res) {

    recursive(__dirname + '/../data/plugins', ['**/*.png', '**/*.svg'], function(err, files) {
        readMultipleFiles(files, 'utf-8', function(err, results) {
            if (err) throw err;
            var x = results.map(function(fileContents) {
                return JSON.parse(fileContents);
            });
            res.status(200).send(x);
        });
    })
});

expressApp.post('/user/settings/set', function(req, res) {

    const settingsPath = __dirname + '/../data/user/';
    const settingsFile = 'settings.json';

    fs.readFile(settingsPath + settingsFile, 'utf-8', function(err, data) {

        if (err) {
            if (err.code === 'ENOENT' && err.errno === -2) {
                if (!fs.existsSync(settingsPath)) fs.mkdirSync(settingsPath);
                fs.writeFile(settingsPath + settingsFile, JSON.stringify([req.body]), function(writeErr) {
                    if (writeErr) throw writeErr;
                    res.status(500).send({success: false}); // 500?
                });
            } else {
                throw err;
                res.status(500).send({success: false}); // 500?
            }

        } else {

            var newSettings = JSON.parse(data);
            newSettings.push(req.body);

            fs.writeFile(settingsPath + settingsFile, JSON.stringify(newSettings), function(err) {
                if (err) throw err;
            });

            res.status(200).send({success: true});

        }
    });
});

expressApp.get('/img/service/*', function(req, res) {
    var file = req.url.replace('/img/service', __dirname + '/../data/plugins');
    res.status(200).sendFile(path.resolve(file));
});

// set up app to listen on port
expressApp.listen(6378);
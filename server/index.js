// dependencies
var path = require("path");
var express = require("express");
var recursive = require('recursive-readdir');
var readMultipleFiles = require('read-multiple-files');

// set up express app
var expressApp = express();

// link static resources
expressApp.use(express.static(__dirname + '/../app'));

// routing
expressApp.get('/', function(req,res) {
  res.sendFile(path.join(__dirname+'/../app/index.html'));
});

expressApp.get('/pre-configured-tabs', function(req,res) {

    recursive(__dirname + '/../data', ['**/*.png', '**/*.svg'], function(err, files) {
        readMultipleFiles(files, 'utf-8', function(err, results) {
            if (err) throw err;
            var x = results.map(function(fileContents) {
                return JSON.parse(fileContents);
            });
            res.status(200).send(x);
        });
    })
});

expressApp.get('/img/service/*', function(req, res) {
    var file = req.url.replace('/img/service', __dirname + '/../data');
    res.status(200).sendFile(path.resolve(file));
});

// set up app to listen on port
expressApp.listen(6378);
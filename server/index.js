// dependencies
var path = require("path");
var express = require("express");

// set up express app
var expressApp = express();

// link static resources
expressApp.use(express.static(__dirname + '/../app'));

// routing
expressApp.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/../app/index.html'));
});

expressApp.get('/pre-configured-tabs',function(req,res){
  res.sendFile(path.join(__dirname+'/../data/twitter/config.json'));
});

// set up app to listen on port
expressApp.listen(6378);
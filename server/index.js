/******************************************************************************/

/**
 * Server configuration file for Hermit Shell Browser tabs app
 * @author Phil Gibbins (@Scoobster17)
 */

/******************************************************************************/

/**
 * DEPENDENCIES
 */

// framework
const express = require("express");
const bodyParser = require('body-parser');

// app components
const { setupRouting } = require('./routing/routes');
const { setupIntercepts } = require('./routing/intercepts');

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
 * ROUTING
 */
setupRouting(expressApp);
setupIntercepts(expressApp);

/******************************************************************************/

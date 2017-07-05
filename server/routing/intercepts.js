/******************************************************************************/

/**
 * DEPENDENCIES
 */

// utilities
const path = require("path");

/******************************************************************************/

/**
 * INTERCEPTS
 */

module.exports = {
    setupIntercepts: (app) => {

        /**
         * Intercept image requests as each plugin's image is located separately in it's
         * corresponding plugin file. Serve the file from the required folder.
         */
        app.get('/img/service/*', (req, res) => {
            const file = req.url.replace('/img/service', __dirname + '/../../data/plugins');
            res.status(200).sendFile( path.resolve(file) );
        });

    }
};
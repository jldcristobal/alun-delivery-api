
const log4js = require('log4js');
const config = require('config');
const JWT = require('jsonwebtoken');
const util = require('../helpers/util');

/**
 * Set up logging
 */
const logger = log4js.getLogger('authentication handler');
logger.level = config.logLevel;

/**
 * auth Handler object
 */
const authHandler = {};


/**
 * auth handler function
 */
authHandler.authenticateUser = (req, res, next) => {
    logger.debug('authenticateUser handler...');
    let token = req.headers.authorization;
    if (!token) {
        jsonRes = {
            errors: [{
                code: 401,
                message: 'No token provided.',
                details: {}
            }],
            statusCode: 401
        };
        util.sendResponse(res, jsonRes);
    } else {
        token = token.split(" ")[1];
        JWT.verify(token, config.tokenSecret, function (err, decoded) {
            if (err) {
                jsonRes = {
                    errors: [{
                        code: 401,
                        message: 'user un-authorized',
                        details: {}
                    }],
                    statusCode: 401
                };
                util.sendResponse(res, jsonRes);
            } else {
                console.log('*************************** user authenticated');
                console.log(decoded);
                res.locals.user = decoded;
                next();
            }

    });
    }

};

module.exports = authHandler;
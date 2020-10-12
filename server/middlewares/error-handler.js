const config = require('config');
const createError = require('http-errors');
const log4js = require('log4js');

const util = require('../helpers/util');

/**
 * Set up logging
 */
const logger = log4js.getLogger('error-handler');
logger.level = config.logLevel;

/**
 * Error Handler object
 */
const errorHandler = {};

/**
 * Catch 404 Error and forward to error handler function
 */
errorHandler.catchNotFound = (req, res, next) => {
  logger.error(`404: The path ${req.url} does not exist`);
  next(createError(404, '404: Page not found'));
};

/**
 * Error handler function
 */
errorHandler.handleError = (err, req, res, next) => {
  logger.debug('error handler...');
  const jsonRes = {
    statusCode: err.status || 500,
    success: false,
    message: err.message,
  };
  util.sendResponse(res, jsonRes);
};

module.exports = errorHandler;

const log4js = require('log4js');
const config = require('config');

const util = require('../../helpers/util');
const logger = log4js.getLogger('controllers - health');
logger.level = config.logLevel;     

/**
 * Controller object
 */
const health = {};

// Get health status of node server
health.getHealth = (req, res) => {
  logger.debug('inside getHealth()...');

  const jsonRes = {
    statusCode: 200,
    success: true,
    message: 'Server is up!',
    status: 'UP',
  };

  util.sendResponse(res, jsonRes);
};

module.exports = health;

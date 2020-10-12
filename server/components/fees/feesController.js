const log4js = require('log4js');
const config = require('config');

const util = require('../../helpers/util');
const logger = log4js.getLogger('controllers - delivery fee');
logger.level = config.logLevel;     

/**
 * Controller object
 */
const fees = {};

// Get health status of node server
fees.getByDistance = (req, res) => {
  logger.debug('inside getByDistance()...');

  const jsonRes = {
    statusCode: 200,
    success: true,
    deliveryFee: 300
  };

  util.sendResponse(res, jsonRes);
};

module.exports = fees;

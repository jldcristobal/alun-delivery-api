const express = require('express');
const log4js = require('log4js');
const config = require('config');

const feesCtrl = require('./feesController');

const router = express.Router();

/**
 * Set up logging
 */
const logger = log4js.getLogger('routes - fees');
logger.level = config.logLevel;

logger.debug('setting up /fees route');

/**
 * Add routes
 */
router.get('/distance', feesCtrl.getByDistance);

module.exports = router;

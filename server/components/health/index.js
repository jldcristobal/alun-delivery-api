const express = require('express');
const log4js = require('log4js');
const config = require('config');

const healthCtrl = require('./healthController');

const router = express.Router();

/**
 * Set up logging
 */
// const logger = log4js.getLogger('routes - health');
// logger.level = config.logLevel;

// logger.debug('setting up /health route');

/**
 * Add routes
 */
router.get('/', healthCtrl.getHealth);

module.exports = router;

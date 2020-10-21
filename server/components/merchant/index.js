const express = require('express');
const log4js = require('log4js');
const config = require('config');

const merchantCtrl = require('./merchantController');

const router = express.Router();

/**
 * Set up logging
 */
// const logger = log4js.getLogger('routes - fees');
// logger.level = config.logLevel;

// logger.debug('setting up /fees route');

/**
 * Add routes
 */
// router.get('/:merchantName', merchantsCtrl.validateMerchant);
router.post('/contact', merchantCtrl.getMerchantContacts);

module.exports = router;

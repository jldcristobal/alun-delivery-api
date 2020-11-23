const express = require('express');
const log4js = require('log4js');
const config = require('config');

const deliveryCtrl = require('./deliveryController');

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
router.post('/', deliveryCtrl.createDelivery);
router.get('/', deliveryCtrl.viewDeliveries);
router.put('/:deliveryId/cancel', deliveryCtrl.cancelDelivery);

module.exports = router;

const express = require('express');
// const log4js = require('log4js');

const orderController = require('./orderController');

const router = express.Router();

/**
 * Set up logging
 */

// const logger = log4js.getLogger('routes - user-enrollment');
// logger.level = config.logLevel;
// logger.debug('setting up /user-enrollment route');
console.log('routes - user-enrollment');


/**
 * Add routes
 */
router.post("/add", orderController.addOrder)
router.post("/retrieve", orderController.getOrder)
router.post("/update", orderController.updateOrder)

module.exports = router;
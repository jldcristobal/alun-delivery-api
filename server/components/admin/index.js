const express = require('express');
const adminController = require('./adminController')

const router = express.Router()
console.log('routes - admin')

/**
 * Add routes
 */
router.post("/notify/order", adminController.notifyOrderSms)
router.post("/notify/response", adminController.notifyChatResponse)
router.post("/add", adminController.add)

module.exports = router

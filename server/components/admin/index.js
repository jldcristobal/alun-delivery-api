const express = require('express');
const adminController = require('./adminController')

const router = express.Router()
console.log('routes - admin')

/**
 * Add routes
 */
router.post("/notify", adminController.sendSms)

module.exports = router

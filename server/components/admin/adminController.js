const config = require('config')
const axios = require('axios')
const util = require('../../helpers/util')
const Admin = require('./adminModel')
const { orderDetails } = require('../order/orderController')

console.log('controllers - admin')

/**
 * Controller object
 */
const admin = {}

/*
 * Get phone number of Alun Food admins from database
 */
const getPhoneNumbers = async () => {
    try {
        const numbers = await Admin.findAll({
            attributes: [ 'phone_number' ]
        }, {
            where: { notification_on: 1 }
        })
        return numbers
    } catch (e) {
        console.log(e)
    }
}

/*
 * Format order cart to SMS-friendly message
 * @param {String} orderNumber
 * @param {String} orderCart: JSON string
 */
const formatSms = (orderNumber, orderCart) => {
    const order = JSON.parse(orderCart)
    var text = `Good day from ALUN FOOD! We just received the following order for ${order.merchant}:\n\n`

    JSON.parse(order.cart).forEach(cart => {
        Object.keys(cart).forEach(key => {
            if (key == "item") text += `* ${cart[key]}\n`
            else text += `${cart[key]}\n`
        })
        text += "\n"
    })

    text += `[Ref: Order No. ${orderNumber}]\n\nPlease reply "Okay" to confirm that you have received this message, or you may also check your FB messenger to respond to this order.\n\nThank you!`

    return text
}

/**
 * Send SMS notification to Alun Food admin
 */
admin.sendSms = async (req, res) => {

    let jsonRes
    const { orderUuid } = req.body

    try {
        const { order_number, order_cart } = await orderDetails(orderUuid)
        const message = formatSms(order_number, order_cart)
        console.log(message)

        try {
            const numbers = await getPhoneNumbers()
            numbers.forEach(async (number) => {
                console.log(number.getDataValue("phone_number"))
                try {
                    let response = await axios.post("https://api.semaphore.co/api/v4/messages", {
                        apikey: config.SEMAPHORE_API_KEY,
                        number: number.getDataValue("phone_number"),
                        message: message,
                        sendername: "ALUN"
                    })
                    console.log({response})
                } catch (err) {
                    console.log(err)
                }
            })
            jsonRes = {
                statusCode: 200,
                success: true,
                message: `SMS notification for Order No. ${order_number} sent to admins!`
            }
        } catch (err) {
            console.log(err)
        }

    } catch (err) {
        console.log(err)
    }

    util.sendResponse(res, jsonRes)
}

module.exports = admin
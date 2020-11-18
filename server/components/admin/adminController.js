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

const formatSms = (orderNumber, orderCart) => {
    return `Order No. ${orderNumber} \n\n${orderCart}`
}

/**
 * Add order
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
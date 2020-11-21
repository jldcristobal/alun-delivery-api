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
const getAdminInfo = async () => {
    try {
        const info = await Admin.findAll({
            attributes: [ 'phone_number', 'subscriber_id' ]
        }, {
            where: { notification_on: 1 }
        })
        return info
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
 * Send SMS notification for orders to Alun Food admin
 */
admin.notifyOrderSms = async (req, res) => {

    let jsonRes
    const { orderUuid } = req.body

    try {
        const { order_number, order_cart } = await orderDetails(orderUuid)
        const message = formatSms(order_number, order_cart)
        console.log(message)

        try {
            const adminInfo = await getAdminInfo()
            adminInfo.forEach(async (info) => {
                console.log(info.getDataValue("phone_number"))
                try {
                    let response = await axios.post("https://api.semaphore.co/api/v4/messages", {
                        apikey: config.SEMAPHORE_API_KEY,
                        number: info.getDataValue("phone_number"),
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

/*
 * Send Messenger notifications for merchant response on orders
 */
admin.notifyChatResponse = async (req, res) => {
    
    const { textResponse } = req.body

    try {
        const adminInfo = await getAdminInfo()
        adminInfo.forEach(async (info) => {
            try {
                let response = await axios.post("https://api.manychat.com/fb/sending/sendContent", {
                    subscriber_id: info.getDataValue("subscriber_id"),
                    data: {
                        version: "v2",
                        content: {
                            messages: [
                                {
                                    type: "text",
                                    text: textResponse
                                }
                            ]
                        }
                    },
                    message_tag: "POST_PURCHASE_UPDATE"
                }, {
                    headers: {
                        Authorization: `Bearer ${config.MANYCHAT_API_KEY}`
                    }
                })

                console.log({response})

                if (response.data.status == "success") {
                    util.sendResponse(res, {
                        statusCode: 200,
                        success: true,
                        message: "Response forwarded to admins!"
                    })
                } else {
                    util.sendResponse(res, {
                        statusCode: 500,
                        success: false,
                        message: "Failed to forward response to admins!"
                    })
                }
            } catch (err) {
                console.error(err)
            }
        })
    } catch (err) {
        console.error(err)
    }
}

module.exports = admin
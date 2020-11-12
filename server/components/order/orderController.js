// const log4js = require('log4js');
const config = require('config')
//const { result } = require('lodash');
//const { Logger } = require('log4js');

const axios = require('axios')
const mysqlDbHelper = require('../../helpers/mysql-db-helper')
const util = require('../../helpers/util')

// const logger = log4js.getLogger('controllers - userEnrollment');
// logger.level = config.logLevel;
console.log('controllers - userEnrollment')

/**
 * Controller object
 */
const order = {}

const isOrderConfirmed = async (orderUuid) => {
   const query = `SELECT * FROM orders WHERE order_uuid = '${orderUuid}'`

   try {
      const status = await mysqlDbHelper.execute(query)
      //console.log(status[0])
      return status[0]
   } catch (err) {
      console.log({err})
   }
}

/**
 * Add order
 */
order.addOrder = async (req, res) => {

   let jsonRes
   const { orderUuid, orderNumber, orderCart, merchantName, orderPlatform, merchantContacts } = req.body

   const query = `INSERT INTO orders (order_uuid, order_number, order_cart, merchant_name, order_platform, merchant_contacts) 
      VALUES ('${orderUuid}', '${orderNumber}', '${orderCart}', '${merchantName}', '${orderPlatform}', '${merchantContacts}')`

   let addOrder = mysqlDbHelper.execute(query)

   addOrder.then(() => { 
      jsonRes = {
        statusCode: 200,
        success: true,
        message: "Order added successfully"
      }
   }).catch((error) => {
      console.log(error)

      jsonRes = {
         statusCode: 500,
         success: false,
         message: error,
      }
   }).finally(() => {
      util.sendResponse(res, jsonRes)
      order.followUp(orderUuid)
   })
}

order.followUp = (orderUuid) => {
   setTimeout(async () => {
      try {
         const { order_uuid, order_confirmed, order_number, merchant_contacts } = await isOrderConfirmed(orderUuid)
         const contactIds = merchant_contacts.split(",")
         if (!order_confirmed) {
            console.log("Order not confirmed")
            contactIds.forEach(async (id) => {
               try {
                  let response = await axios.post("https://api.manychat.com/fb/sending/sendContent", {
                     subscriber_id: id,
                     data: {
                        version: "v2",
                        content: {
                           messages: [
                              {
                                 type: "text",
                                 text: `{{first_name}}, please use the buttons below to confirm or send feedback regarding 📋 Order No. ${order_number} \n\nOtherwise, a member of our team will call you after two minutes to manually follow up on the order. Thanks! 😊`,
                                 buttons: [
                                    {
                                       type: "dynamic_block_callback",
                                       caption: `Confirm order ✅`,
                                       url: "https://dev-api.alun.app/api/order/update",
                                       method: "post",
                                       headers: {
                                          Authorization: `Bearer {{accessToken}}`
                                       },
                                       payload: {
                                          orderUuid: order_uuid,
                                          orderNumber: order_number,
                                          updateType: "confirm",
                                          confirmerId: "{{id}}"
                                       }
                                    },
                                    {
                                       type: "dynamic_block_callback",
                                       caption: "Send feedback 💬",
                                       url: "https://dev-api.alun.app/api/order/update",
                                       method: "post",
                                       headers: {
                                          Authorization: `Bearer {{accessToken}}`
                                       },
                                       payload: {
                                          orderUuid: order_uuid,
                                          orderNumber: order_number,
                                          updateType: "feedback",
                                          confirmerId: "{{id}}"
                                       }
                                    }
                                 ]
                              }
                           ],
                           actions: [],
                           quick_replies: []
                        }
                     },
                     message_tag: "POST_PURCHASE_UPDATE"
                  }, {
                     headers: {
                        Authorization: `Bearer ${config.MANYCHAT_API_KEY}`
                     }
                  })

                  if (response.data.status == "success") {
                     console.log("Message sent!")
                  } else {
                     console.log("Message not sent!")
                  }
               } catch (e) {
                  console.log(e)
               }
            })
         } else {
            console.log("Order already confirmed! No need to follow up!")
         }
      } catch (err) {
         console.log("Error: ", err)
      }
   }, config.followUpWindow)
}

/**
 * Retrieve order details
 */
order.getOrder = async (req, res) => {

   let jsonRes
   const { orderUuid } = req.body
   const query = `SELECT * FROM orders WHERE order_uuid = "${orderUuid}"`

   let getOrder = mysqlDbHelper.execute(query)

   const formatCart = (orders) => {
      var text = ""
      var cart = JSON.parse(orders)[0].cart
      //console.log(cart[0].merchant)
      for (var item of cart) {
         Object.keys(item).forEach((key) => {
            if (key == "item") text += "📌 " + item[key] + "\n"
            else text +=  item[key] + "\n"
         })
         text += "\n"
      }
      return text
   }

   getOrder.then((result) => { 

      /*jsonRes = {
         statusCode: 200,
         success: true,
         message: "Order retrieved successfully",
         result: result
      };  */
      const { order_uuid, order_number, order_cart, merchant_name } = result[0]

      jsonRes = {
         statusCode: 200,
         version: "v2",
         content: {
            messages: [
               {
                  type: "text",
                  text: `👋 Hi {{first_name}}! We received the following order(s) for ${merchant_name}: \n\n ${formatCart(order_cart)}Ref: 📋 Order No. ${order_number}`,
                  buttons: [
                     {
                        type: "dynamic_block_callback",
                        caption: `Confirm ORD#${order_number} ✅`,
                        url: "https://dev-api.alun.app/api/order/update",
                        method: "post",
                        headers: {
                           Authorization: "Bearer"
                        },
                        payload: {
                           orderUuid: order_uuid,
                           orderNumber: order_number,
                           updateType: "Bearer"
                        }
                     },
                     {
                        type: "dynamic_block_callback",
                        caption: "Send feedback 💬",
                        url: "https://dev-api.alun.app/api/order/update",
                        method: "post",
                        headers: {
                           Authorization: ""
                        },
                        payload: {
                           orderUuid: order_uuid,
                           orderNumber: order_number,
                           updateType: "feedback"
                        }
                     }
                  ]
               }
            ],
            actions: [
               {
                  action: "set_field_value",
                  field_name: "MerchantName",
                  value: merchant_name
               }
            ],
            quick_replies: []
         }
      }
   }).catch((error) => {
      console.log(error)

      jsonRes = {
         statusCode: 500,
         success: false,
         message: error,
      }
   }).finally(() => {
      util.sendResponse(res, jsonRes)
   })
}

/**
 * Update order status
 */
order.updateOrder = async (req, res) => {

   let jsonRes
   const { orderUuid, orderNumber, updateType, confirmerId } = req.body
   const query = `UPDATE orders SET order_confirmed = ${1} WHERE order_uuid = "${orderUuid}"`

   let getOrder = mysqlDbHelper.execute(query)

   getOrder.then(async () => { 
      /*jsonRes = {
         statusCode: 200,
         success: true,
         message: "Order updated successfully"
      }*/
      if (updateType === "confirm") {
         jsonRes = {
            statusCode: 200,
            version: "v2",
            content: {
               messages: [
                  {
                     type: "text",
                     text: `Awesome, {{first_name}}! 🤗 You have confirmed 📋 Order No. ${orderNumber}`,
                     buttons: []
                  }
               ],
               actions: [],
               quick_replies: []
            }
         }
         console.log("Send Accept Order flow")

         try {
            let response = await axios.post("https://api.manychat.com/fb/sending/sendFlow", {
               subscriber_id: confirmerId,
               flow_ns: "content20201019151906_485264" // Accept Order
            }, {
               headers: {
                  Authorization: `Bearer ${config.MANYCHAT_API_KEY}`
               }
            })
            if (response.data.status == "success") {
               console.log("User redirected to Accept Order flow")
            } else {
               console.log("User not redirected to Accept Order flow")
            }
         } catch (e) {
            console.log(e)
         }
      } else {
         jsonRes = {
            statusCode: 200,
            version: "v2",
            content: {
               messages: [
                  {
                     type: "text",
                     text: `No worries {{first_name}}! Please tell us which items are not available on 📋 Order No. ${orderNumber}`,
                     buttons: []
                  }
               ],
               actions: [],
               quick_replies: []
            }
         }
         console.log("Send Order Feedback flow")
         try {
            let response = await axios.post("https://api.manychat.com/fb/sending/sendFlow", {
               subscriber_id: confirmerId,
               flow_ns: "content20201019152011_509316" // Order Feedback
            }, {
               headers: {
                  Authorization: `Bearer ${config.MANYCHAT_API_KEY}`
               }
            })
            if (response.data.status == "success") {
               console.log("User redirected to Order Feedback flow")
            } else {
               console.log("User not redirected to order Feedback flow")
            }
         } catch (e) {
            console.log(e)
         }
      }
   }).catch((error) => {
      console.log(error)

      jsonRes = {
         statusCode: 500,
         success: false,
         message: error,
      }
   }).finally(() => {
      util.sendResponse(res, jsonRes)
   })
}

module.exports = order
// const log4js = require('log4js');
const config = require('config')
//const { result } = require('lodash');
//const { Logger } = require('log4js');

const axios = require('axios')
const util = require('../../helpers/util')
const Orders = require('./orderModel')

// const logger = log4js.getLogger('controllers - userEnrollment');
// logger.level = config.logLevel;
console.log('controllers - userEnrollment')

/**
 * Controller object
 */
const order = {}

/*
 * Fetch order data from database
 * @param {String} orderUuid: UUID of order to be retrieved
 */
const getOrderDetails = async (orderUuid) => {
   try {
      const order = await Orders.findOne({
         where: { order_uuid: orderUuid }
      })
      return order.dataValues
   } catch (err) {
      console.log({err})
   }
}

/*
 * Automatic follow up
 * Send message reminder if order has not been responded within the follow up window
 * @param {String} orderUuid: UUID of order to be followed up
 * @param {String} accessToken: Alun API access token
 */
const followUp = (orderUuid, accessToken) => {
   setTimeout(async () => {
      try {
         const { order_uuid, order_confirmed, order_number, merchant_contacts } = await getOrderDetails(orderUuid)
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
                                 text: `⚡ {{first_name}}, Order No. ${order_number} is still pending. Please use the buttons provided below to confirm ✅ or send feedback 💬 regarding this order. \n\nOtherwise, a member of our team will call you after 2 minutes to manually follow up on the order. Thanks! 😊`,
                                 buttons: [
                                    {
                                       type: "dynamic_block_callback",
                                       caption: `Confirm ORD#${order_number} ✅`,
                                       url: "https://dev-api.alun.app/api/order/update",
                                       method: "post",
                                       headers: {
                                          Authorization: `Bearer ${accessToken}`
                                       },
                                       payload: {
                                          orderUuid: order_uuid,
                                          orderNumber: order_number,
                                          updateType: "confirm",
                                          confirmerId: "{{user_id}}",
                                          currentUser: "{{first_name}}",
                                          confirmedBy: "{{first_name}}"
                                       }
                                    },
                                    {
                                       type: "dynamic_block_callback",
                                       caption: "Send feedback 💬",
                                       url: "https://dev-api.alun.app/api/order/update",
                                       method: "post",
                                       headers: {
                                          Authorization: `Bearer ${accessToken}`
                                       },
                                       payload: {
                                          orderUuid: order_uuid,
                                          orderNumber: order_number,
                                          updateType: "feedback",
                                          confirmerId: "{{user_id}}",
                                          currentUser: "{{first_name}}",
                                          confirmedBy: "{{first_name}}"
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
            console.log(`Order No. ${order_number} already confirmed! No need to follow up!`)
         }
      } catch (err) {
         console.log("Error: ", err)
      }
      finalPrompt(orderUuid)
   }, config.followUpWindow)
}

/*
 * Automatic follow up
 * Send final prompt if no response is received after previous message reminder
 * @param {String} orderUuid: UUID of order to be followed up
 */
const finalPrompt = (orderUuid) => {
   setTimeout(async () => {
      try {
         const { order_confirmed, order_number, merchant_contacts } = await getOrderDetails(orderUuid)
         const contactIds = merchant_contacts.split(",")
         if (!order_confirmed) {
            console.log("Order still not confirmed!")
            contactIds.forEach(async (id) => {
               try {
                  const sendMessage = await axios.post("https://api.manychat.com/fb/sending/sendContent", {
                     subscriber_id: id,
                     data: {
                        version: "v2",
                        content: {
                           messages: [
                              {
                                 type: "text",
                                 text: `🔔 {{first_name}}, we have not received any response regarding Order No. ${order_number}.`,
                                 buttons: []
                              }
                           ],
                           actions: [
                              {
                                 action: "set_field_value",
                                 field_name: "OrderNumber",
                                 value: order_number
                              }
                           ],
                           quick_replies: []
                        }
                     },
                     message_tag: "POST_PURCHASE_UPDATE"
                  }, {
                     headers: {
                        Authorization: `Bearer ${config.MANYCHAT_API_KEY}`
                     }
                  })

                  if (sendMessage.data.status == "success") {
                     console.log(`Final prompt message SENT for Order No. ${order_number}`)
                     const sendFlow = await axios.post("https://api.manychat.com/fb/sending/sendFlow", {
                        subscriber_id: id,
                        flow_ns: "content20201031171458_452545" // Order Prompt - Unconfirmed Order
                     }, {
                        headers: {
                           Authorization: `Bearer ${config.MANYCHAT_API_KEY}`
                        }
                     })

                     if (sendFlow.data.status == "success") {
                        console.log(`User redirected to Unconfirmed Order flow`)
                     } else {
                        console.log(`User not redirected to Unconfirmed Order flow`)
                     }
                  } else {
                     console.log(`Final prompt message NOT SENT for Order No. ${order_number}`)
                  }
               } catch (e) {
                  console.log(e)
               }
            })
         } else {
            console.log(`Order No. ${order_number} already confirmed! No need to follow up!`)
         }
      } catch (e) {
         console.log(e)
      }
   }, config.followUpWindow)
}

// ORDER API ENDPOINTS

/**
 * Add order
 */
order.addOrder = async (req, res) => {

   let jsonRes
   const { orderUuid, orderNumber, orderCart, merchantName, orderPlatform, merchantContacts, accessToken } = req.body

   try {
      await Orders.create({
         order_uuid: orderUuid,
         order_number: orderNumber,
         order_cart: orderCart,
         merchant_name: merchantName,
         order_platform: orderPlatform,
         merchant_contacts: merchantContacts,
      })

      jsonRes = {
         statusCode: 200,
         success: true,
         message: "Order added successfully"
       }
   } catch (err) {
      console.log(err)
      jsonRes = {
         statusCode: 500,
         success: false,
         message: "Failed to add order!",
         errors: err.errors
      }
   }

   util.sendResponse(res, jsonRes)
   followUp(orderUuid, accessToken)
}

/*
 * For testing purposes
 */
order.test = async (req, res) => {
   let jsonRes = {
      statusCode: 200,
      success: true,
      message: "Test success!",
   }

   //finalPrompt(req.body.orderUuid)
   getOrderDetails(req.body.orderUuid)

   util.sendResponse(res, jsonRes)
}

/**
 * Update order status
 */
order.updateOrder = async (req, res) => {

   let jsonRes
   const { orderUuid, orderNumber, updateType, confirmerId, currentUser, confirmedBy } = req.body
   
   try {
      const { order_confirmed, confirmed_by } = await getOrderDetails(orderUuid)
      if (order_confirmed) {
         console.log("Order already confirmed by", confirmed_by)
         let message = ""
         if (currentUser == confirmed_by) {
            message = `👍🏼 {{first_name}}, you have already attended to Order No. ${orderNumber}. Just stand by for the next orders! 🌊`
         } else {
            message = `👍🏼 Order No. ${orderNumber} has already been attended by ${confirmed_by}. Just stand by for the next orders, {{first_name}}! 🌊`
         }
         jsonRes = {
            statusCode: 200,
            version: "v2",
            content: {
               messages: [
                  {
                     type: "text",
                     text: message,
                     buttons: []
                  }
               ],
               actions: [],
               quick_replies: []
            }
         }
         util.sendResponse(res, jsonRes)
      } else {
         let getOrder = Orders.update({
            order_confirmed: 1,
            confirmed_by: confirmedBy
         }, {
            where: { order_uuid: orderUuid }
         })

         getOrder.then(async () => { 
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
                     actions: [
                        {
                           action: "set_field_value",
                           field_name: "OrderNumber",
                           value: orderNumber
                        }
                     ],
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
                           text: `No worries {{first_name}}! 😄 Please tell us which items or ingredients are not available for 📋 Order No. ${orderNumber}`,
                           buttons: []
                        }
                     ],
                     actions: [
                        {
                           action: "set_field_value",
                           field_name: "OrderNumber",
                           value: orderNumber
                        }
                     ],
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
   } catch (e) {
      console.log(e)
   }
}

module.exports = order
module.exports.orderDetails = getOrderDetails
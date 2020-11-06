// const log4js = require('log4js');

const mysqlDbHelper = require('../../helpers/mysql-db-helper')
const util = require('../../helpers/util')

// const logger = log4js.getLogger('controllers - userEnrollment');
// logger.level = config.logLevel;
console.log('controllers - userEnrollment')

/**
 * Controller object
 */
const order = {}

/**
 * Add order
 */
order.addOrder = async (req, res) => {

   let jsonRes
   const { orderUuid, orderNumber, orderCart, merchantName, orderPlatform } = req.body

   const query = `INSERT INTO orders (order_uuid, order_number, order_cart, merchant_name, order_platform) 
      VALUES ('${orderUuid}', '${orderNumber}', '${JSON.stringify(orderCart)}', '${merchantName}', '${orderPlatform}')`

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
   })
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
            "quick_replies": []
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
   const { orderUuid, updateType } = req.body
   const query = `UPDATE orders SET order_confirmed = ${1} WHERE order_uuid = "${orderUuid}"`

   if (updateType === "confirm") {
      console.log("Send Order Confirmation flow")
   } else {
      console.log("Send Order Feedback flow")
   }

   let getOrder = mysqlDbHelper.execute(query)

   getOrder.then(() => { 
      jsonRes = {
         statusCode: 200,
         success: true,
         message: "Order updated successfully"
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
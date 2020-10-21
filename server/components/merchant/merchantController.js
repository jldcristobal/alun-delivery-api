const log4js = require('log4js');
const config = require('config');

const mysqlDbHelper = require('../../helpers/mysql-db-helper');
const util = require('../../helpers/util');
// const logger = log4js.getLogger('controllers - delivery fee');
// logger.level = config.logLevel;     

/**
 * Controller object
 */
const merchant = {};

/**
 * Get merchant contact list
 */ 
merchant.getMerchantContacts = (req, res) => {
  // logger.debug('inside getByDistance()...');
  console.log('inside getMerchantContacts()...');
  
  let jsonRes;
  
  const merchantName = req.body.merchantName
  
  let query = `SELECT * FROM merchants WHERE merchant_name = "${merchantName}"`
  let getMerchantId = mysqlDbHelper.execute(query)

  let merchantId
 
  getMerchantId.then((merchant) => {
    if(merchant.length === 0) {
      jsonRes = {
        statusCode: 200,
        success: true,
        result: null,
        message: 'Invalid merchant name'
      };
    } else {
      merchantId = merchant[0].merchant_id
    }
  }).catch((error) => {
    console.log(error);
    // logger.error(error);

    jsonRes = {
      errors: [{
        code: 500,
        message: error,
      }],
      statusCode: 500
    };

  }).finally(() => {
      query = `SELECT merchant_contact_name, merchant_contact_email FROM merchant_contacts WHERE merchant_id = "${merchantId}"`
      let getMerchantContacts = mysqlDbHelper.execute(query)

      let merchantContacts = []

      getMerchantContacts.then((contacts) => {
        if(contacts.length > 0) {
          contacts.forEach((contact) => { 
            merchantContacts.push({
              name: contact.merchant_contact_name,
              email: contact.merchant_contact_email
            })
          })

          jsonRes = {
            statusCode: 200,
            success: true,
            result: merchantContacts
          };
        } else {
          jsonRes = {
            statusCode: 200,
            success: true,
            result: null
          };
        }
      }).catch((error) => {
        console.log(error)

        jsonRes = {
          errors: [{
            code: 500,
            message: error,
          }],
          statusCode: 500
        };
      }).finally(() => {
        util.sendResponse(res, jsonRes);
      })
  });
};

module.exports = merchant;

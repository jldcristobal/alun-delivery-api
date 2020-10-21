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
 * Add  to list of merchants
 * @param {merchantName, merchantContacts} req 
 * @param {*} res 
 */
merchant.addMerchant = async (req, res) => {
  // logger.info('inside addMerchant()...');
  // logger.debug('request body to add merchant -');
  // logger.debug(req.body);
  console.log('inside addMerchant()...');

  let jsonRes;

  const query = `INSERT INTO merchants(merchant_name) VALUES("${req.body.merchantName}")`
  let addMerchant = mysqlDbHelper.execute(query)
  
  addMerchant.then(() => { 
      jsonRes = {
          statusCode: 200,
          success: true,
          message: 'Merchant added successfully'
      };  
  }).catch((error) => {
      console.log(error)

      jsonRes = {
          statusCode: 500,
          success: false,
          message: error,
      };
  }).finally(() => {
      util.sendResponse(res, jsonRes);
  })
};

/**
 * Add  to list of merchants
 * @param {merchantName} req 
 * @param {*} res 
 */
merchant.addMerchantContact = async (req, res) => {
  // logger.info('inside addMerchantContact()...');
  // logger.debug('request body to add merchant contact -');
  // logger.debug(req.body);
  console.log('inside addMerchantContact()...');

  let jsonRes;

   let merchantName = req.body.merchantName
   let merchantContacts = req.body.merchantContact

     // TODO: validate if merchant contact already exists

    let values = ''
    for(let i = 0; i < merchantContacts.length; i++) {
      values += `(`
      values += `(SELECT merchant_id FROM merchants WHERE merchant_name = "${merchantName}"), `
      values += `"` + merchantContacts[i].name + `", `
      values += `"` + merchantContacts[i].email + `"`
      values += `)`
      if(i < merchantContacts.length - 1) values += `, `
    }

  const query = `INSERT INTO merchant_contacts(merchant_id, merchant_contact_name, merchant_contact_email) VALUES ${values}`
  let addMerchantContact = mysqlDbHelper.execute(query)
  
  addMerchantContact.then(() => { 
      jsonRes = {
          statusCode: 200,
          success: true,
          message: 'Merchant Contact added successfully'
      };  
  }).catch((error) => {
      console.log(error)

      jsonRes = {
          statusCode: 500,
          success: false,
          error: error,
      };
  }).finally(() => {
      util.sendResponse(res, jsonRes);
  })
};

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

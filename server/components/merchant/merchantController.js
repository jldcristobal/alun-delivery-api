const log4js = require('log4js');
const config = require('config');

const Merchant = require('./merchantModel')
const MerchantContact = require('./merchantContactModel')

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

  try{
    let [, created] = await Merchant.findOrCreate({
      where: { merchant_name: req.body.merchantName }
    })
  
    if(!created) {
        jsonRes = {
            statusCode: 400,
            success: false,
            message: 'Merchant already exists'
        };
    } else {
        jsonRes = {
            statusCode: 200,
            success: true,
            message: 'Merchant added successfully'
        }; 
    }
  } catch(error) {
    console.log(error)

      jsonRes = {
          statusCode: 500,
          success: false,
          message: error,
      };
  }
  util.sendResponse(res, jsonRes);
};

/**
 * Add  to list of merchants
 * @param {merchantName, merchantContact} req 
 * @param {*} res 
 */
merchant.addMerchantContact = async (req, res) => {
  // logger.info('inside addMerchantContact()...');
  // logger.debug('request body to add merchant contact -');
  // logger.debug(req.body);
  console.log('inside addMerchantContact()...');

  let jsonRes;

  try {
    let merchantName = req.body.merchantName
    let merchantContacts = req.body.merchantContact
  
    let findMerchant = await Merchant.findOne({
      where: { merchant_name: merchantName }
    })
  
    if(findMerchant !== null) {
      let merchantId = findMerchant.merchant_id

      let addMerchantContact 
  
      if(merchantContacts.length > 1) {
        let body = []
    
        merchantContacts.forEach((contact) => {
          body.push({
            merchant_id: merchantId,
            merchant_contact_name: contact.name,
            merchant_contact_email: contact.email
          })
        })
    
        addMerchantContact = await MerchantContact.bulkCreate(body)
      } else {
        addMerchantContact = await MerchantContact.create({
          merchant_id: merchantId,
          merchant_contact_name: merchantContacts[0].name,
          merchant_contact_email: merchantContacts[0].email
        })
      }
      
      if(addMerchantContact !== null) {
        jsonRes = {
          statusCode: 200,
          success: true,
          message: 'Merchant Contact added successfully'
        }; 
      }
    } else {
      jsonRes = {
        statusCode: 500,
        success: false,
        message: 'Merchant does not exist',
      };
    }
  } catch(error) {
    console.log(error)

    jsonRes = {
        statusCode: 500,
        success: false,
        error: error,
    };
  }

  util.sendResponse(res, jsonRes);
};

/**
 * Get merchant contact list
 */ 
merchant.getMerchantContacts = async (req, res) => {
  // logger.debug('inside getByDistance()...');
  console.log('inside getMerchantContacts()...');
  
  let jsonRes;
  
  try {
    const merchantName = req.body.merchantName

    let getMerchantId = await Merchant.findOne({
      where: { merchant_name: merchantName }
    })
    if(getMerchantId !== null) {
      let merchantId = getMerchantId.merchant_id
  
      let getMerchantContacts = await MerchantContact.findAll({
        where: { merchant_id: merchantId }
      })
  
      let merchantContacts = []
  
      if(getMerchantContacts.length > 0) {
        getMerchantContacts.forEach((contact) => {
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
    } else {
      jsonRes = {
        statusCode: 200,
        success: true,
        message: 'Invalid merchant name'
      };
    }
  } catch(error) {
    console.log(error)

    jsonRes = {
      errors: [{
        code: 500,
        message: error,
      }],
      statusCode: 500
    };
  }
  
  util.sendResponse(res, jsonRes);
};

module.exports = merchant;

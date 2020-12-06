const log4js = require('log4js');
const config = require('config');
const { Sequelize } = require('sequelize');

const Delivery = require('./deliveryModel')
const DeliveryItem = require('./deliveryItemModel')
const DeliveryStatus = require('./deliveryStatusModel')

const util = require('../../../helpers/util');
// const logger = log4js.getLogger('controllers - delivery fee');
// logger.level = config.logLevel;     

/**
 * Controller object
 */
const delivery = {};

/**
 * Create delivery
 */ 
delivery.createDelivery = async (req, res) => {
  // logger.debug('inside createDelivery()...');
  console.log('inside createDelivery()...');

  let jsonRes;

  try {
    let body = req.body
    let trackingNumber = 'CS' + await util.createRandomString(10)

    let [dlvry, created] = await Delivery.findOrCreate({
      where: { trackingNumber: trackingNumber },
      defaults: {
        trackingNumber: trackingNumber,
        senderName: body.senderName,
        senderAddress: body.senderAddress,
        receiverName: body.receiverName,
        receiverAddress: body.receiverAddress,
        nearestLandmark: body.nearestLandmark,
        receiverNumber: body.receiverNumber,
        deliveryDate: body.deliveryDate
      }
    })
  
    if(!created) { 
        jsonRes = {
            statusCode: 400,
            success: false,
            message: 'Could not create booking'
        };
    } else { 
        let deliveryId = dlvry.deliveryId

        created = await DeliveryStatus.create({
          deliveryId: deliveryId,
          status: 'Pending'
        })

        if(!created) {
          jsonRes = {
            statusCode: 400,
            success: false,
            message: 'Could not set booking status'
          };
        } else {
          jsonRes = {
            statusCode: 200,
            success: true,
            message: 'Delivery booking successful'
          };
        }
    }
  } catch(error) { 
    console.log(error);
    // logger.error(error);

    jsonRes = {
      errors: [{
        code: 500,
        message: error,
      }],
      statusCode: 500
    };
  } finally {
    util.sendResponse(res, jsonRes)
  }
};

delivery.viewDeliveries = async (req, res) => {
  // logger.info('inside viewDeliveries()...');

  let jsonRes;
  
  try {
      let deliveryList = await Delivery.findAll({
          attributes: { 
            exclude: ['updatedAt'] 
          },
          include: [
            {
              model: DeliveryStatus,
              attributes: { exclude: ['statusHistoryId', 'deliveryId', 'updatedAt'] }
            }
          ],
          order: [
            ['createdAt', 'DESC'],
            [DeliveryStatus, 'createdAt', 'DESC']
          ]
        });

      if(deliveryList.length === 0) {
          jsonRes = {
              statusCode: 200,
              success: true,
              result: null,
              message: 'Transaction history empty'
          };
      } else {
          jsonRes = {
              statusCode: 200,
              success: true,
              result: deliveryList
          }; 
      }
  } catch(error) {
      jsonRes = {
          statusCode: 500,
          success: false,
          error: error,
      };
  } finally {
      util.sendResponse(res, jsonRes);    
  }
};

delivery.updateStatus = async (req, res) => {
  // logger.info('inside updateStatus()...');

  let jsonRes;
  
  try {
    let [, created] = await DeliveryStatus.findOrCreate({ 
      where: { deliveryId: req.params.deliveryId, status: req.body.status },
      defaults: {
        deliveryId: req.params.deliveryId,
        status: req.body.status 
      }
    });

      if(!created) { 
        jsonRes = {
            statusCode: 400,
            success: false,
            message: 'Could not update delivery status'
        };
      } else {
          jsonRes = {
            statusCode: 200,
            success: true,
            message: 'Delivery booking status updated successfully'
        }; 
      }
  } catch(error) {
      jsonRes = {
          statusCode: 500,
          success: false,
          error: error,
      };
  } finally {
      util.sendResponse(res, jsonRes);    
  }
};

module.exports = delivery;
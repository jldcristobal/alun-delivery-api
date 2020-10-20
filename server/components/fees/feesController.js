const log4js = require('log4js');
const config = require('config');

const mysqlDbHelper = require('../../helpers/mysql-db-helper');
const util = require('../../helpers/util');
// const logger = log4js.getLogger('controllers - delivery fee');
// logger.level = config.logLevel;     

/**
 * Controller object
 */
const fees = {};

/**
 * Get delivery fee according to distance
 */ 
fees.getByDistance = (req, res) => {
  // logger.debug('inside getByDistance()...');
  console.log('inside getByDistance()...');
  
  let jsonRes;
  
  const body = req.body
  const perishable = body.perishable
  const vehicleType = body.vehicleType
  var pickUp = body.deliverFrom.city + ', ' + body.deliverFrom.barangay
  var dropOff = body.deliverTo.city + ', ' + body.deliverTo.barangay

  var baseFare
  var afterBaseFare

  if(!perishable) {
    switch(vehicleType) {
      case('motorcycle'):
        baseFare = 60
        afterBaseFare = 10
        break
      case('tricycle'):
        baseFare = 100
        afterBaseFare = 10
        break
      case('multicab'):
        baseFare = 260
        afterBaseFare = 15
        break
      case('private'):
        baseFare = 260
        afterBaseFare = 20
        break
    }
  } else {
    switch(vehicleType) {
      case('motorcycle'):
        switch(body.deliverFrom.city) {
          case('Iriga'):
            baseFare = 40
            break
          case('Nabua'):
            baseFare = 50
            break
          case('Bato'):
            baseFare = 70
            break
          case('Buhi'):
            baseFare = 80
            break
          case('Baao'):
            baseFare = 60
            break
        }
        afterBaseFare = 5
        break
      case('tricycle'):
        switch(body.deliverFrom.city) {
          case('Iriga'):
            baseFare = 60
            break
          case('Nabua'):
            baseFare = 70
            break
          case('Bato'):
            baseFare = 90
            break
          case('Buhi'):
            baseFare = 100
            break
          case('Baao'):
            baseFare = 80
            break
        }
        afterBaseFare = 10
        break
      case('multicab'):
        switch(body.deliverFrom.city) {
          case('Iriga'):
            baseFare = 220
            break
          case('Nabua'):
            baseFare = 230
            break
          case('Bato'):
            baseFare = 250
            break
          case('Buhi'):
            baseFare = 260
            break
          case('Baao'):
            baseFare = 240
            break
        }
        afterBaseFare = 15
        break
    }
  }

  var locations = [pickUp, dropOff].sort()
  pickUp = locations[0].split(', ')
  dropOff = locations[1].split(', ')
  
  let one = pickUp[1] + ', ' + pickUp[0]
  let two = dropOff[1] + ', ' + dropOff[0]
  
  const query = `SELECT direct_distance FROM rinconadaDD WHERE one = "${one}" AND two = "${two}"`
  
  let getDirectDistance = mysqlDbHelper.execute(query)
  let directDistance;

  getDirectDistance.then((distance) => {
    if(distance.length > 0 || one === two) {
      if(one === two) directDistance = 1
      else directDistance = Math.round(distance[0].direct_distance)
      
      if(directDistance === 0) directDistance++

      const deliveryFee = baseFare + (directDistance - 1) * afterBaseFare;

      jsonRes = {
        statusCode: 200,
        success: true,
        result: {
          deliveryFee: deliveryFee
        }
      };
      
    } else {
      jsonRes = {
        statusCode: 200,
        success: true,
        result: null
      };
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

  }).finally(() => util.sendResponse(res, jsonRes));

};

module.exports = fees;

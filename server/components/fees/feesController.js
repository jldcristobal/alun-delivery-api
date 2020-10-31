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
fees.getByDistance = async (req, res) => {
  // logger.debug('inside getByDistance()...');
  console.log('inside getByDistance()...');

  let jsonRes;

  const body = req.body
  var locationFrom = body.deliverFrom.city + ', ' + body.deliverFrom.barangay
  var locationTo = body.deliverTo.city + ', ' + body.deliverTo.barangay

  var locations = [locationFrom, locationTo].sort()
  locationFrom = locations[0].split(', ')
  locationTo = locations[1].split(', ')

  let one = locationFrom[1] + ', ' + locationFrom[0]
  let two = locationTo[1] + ', ' + locationTo[0]

  const query = `SELECT driving_distance, direct_distance FROM rinconadaDD WHERE one = "${one}" AND two = "${two}"`

  let getDrivingDistance = mysqlDbHelper.execute(query)
  let drivingDistance;
  let directDistance

  getDrivingDistance.then((distance) => {
    if(distance.length > 0 || one === two) {
      if(one === two) {
        jsonRes = {
          statusCode: 200,
          success: true,
          result: {
            deliveryFee: 30
          }
        };
      } else if(distance[0].driving_distance === 0) {
        directDistance = distance[0].direct_distance * 1.5
        
        if(Math.round(directDistance) > 20) {
          jsonRes = {
            statusCode: 200,
            success: true,
            result: null,
            message: 'Unable to get delivery fee. Area Unserviceable'
          }
        } else {
          drivingDistance = Math.round(directDistance)
        }
      } else {
        drivingDistance = Math.round(distance[0].driving_distance)
      }
      
      if(drivingDistance) {
        let deliveryFee;

        switch(true) {
          case(drivingDistance >= 0 && drivingDistance <= 1):
            deliveryFee = 30
            break
          case(drivingDistance >= 2 && drivingDistance <= 3):
            deliveryFee = 45
            break
          case(drivingDistance >= 4 && drivingDistance <= 5):
            deliveryFee = 59
            break
          case(drivingDistance == 6):
            deliveryFee = 65
            break
          case(drivingDistance == 7):
            deliveryFee = 69
            break
          case(drivingDistance == 8):
            deliveryFee = 79
            break
          case(drivingDistance == 9):
            deliveryFee = 89
            break
          case(drivingDistance == 10):
            deliveryFee = 110
            break
          case(drivingDistance >= 11 && drivingDistance <= 15):
            deliveryFee = 150
            break
          case(drivingDistance >= 16 && drivingDistance <= 20):
            deliveryFee = 200
            break
          default:
            break
        }
        
        jsonRes = {
          statusCode: 200,
          success: true,
          result: {
            deliveryFee: deliveryFee
          }
        };
      }
    } else {
      jsonRes = {
        statusCode: 200,
        success: true,
        result: null,
        message: 'Location data is unavailable'
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

/**
 * Get delivery fee according to courier distance
 */ 
fees.getByCourierDistance = (req, res) => {
  // logger.debug('inside getByCourierDistance()...');
  console.log('inside getByCourierDistance()...');
  
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
  
  const query = `SELECT driving_distance, direct_distance FROM rinconadaDD WHERE one = "${one}" AND two = "${two}"`
  
  let getDrivingDistance = mysqlDbHelper.execute(query)
  let drivingDistance;

  getDrivingDistance.then((distance) => {
    if(distance.length > 0 || one === two) {
      if(one === two) {
        drivingDistance = 1
      } else if(distance.length > 0 && distance[0].driving_distance === 0) {
        directDistance = distance[0].direct_distance * 1.5 
        
        if(directDistance > 30) {
          jsonRes = {
            statusCode: 200,
            success: true,
            result: null,
            message: 'Unable to get delivery fee. Area Unserviceable'
          }
        } else {
          drivingDistance = Math.round(directDistance)
        }
      } else {
        drivingDistance = Math.round(distance[0].driving_distance)
      }

      if(drivingDistance === 0) drivingDistance++
      
      if(drivingDistance) {
        const deliveryFee = baseFare + ((drivingDistance - 1) * afterBaseFare);

        jsonRes = {
          statusCode: 200,
          success: true,
          result: {
            deliveryFee: deliveryFee
          }
        };
      }
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

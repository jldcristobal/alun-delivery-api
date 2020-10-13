const log4js = require('log4js');
const config = require('config');

const mysqlDbHelper = require('../../helpers/mysql-db-helper');
const util = require('../../helpers/util');
const logger = log4js.getLogger('controllers - delivery fee');
logger.level = config.logLevel;     

/**
 * Controller object
 */
const fees = {};

/**
 * Get delivery fee according to distance
 */ 
fees.getByDistance = (req, res) => {
  logger.debug('inside getByDistance()...');
  
  let jsonRes;
  
  const body = req.body
  var locationFrom = body.deliverFrom.city + ', ' + body.deliverFrom.barangay
  var locationTo = body.deliverTo.city + ', ' + body.deliverTo.barangay

  var locations = [locationFrom, locationTo].sort()
  locationFrom = locations[0].split(', ')
  locationTo = locations[1].split(', ')
  
  let one = locationFrom[1] + ', ' + locationFrom[0]
  let two = locationTo[1] + ', ' + locationTo[0]
  
  const query = `SELECT direct_distance FROM rinconadadd WHERE one = "${one}" AND two = "${two}"`
  
  let getDirectDistance = mysqlDbHelper.execute(query)
  let directDistance;

  getDirectDistance.then((distance) => {
    if(distance.length > 0 || one === two) {
      if(one === two) directDistance = 0
      else directDistance = Math.round(distance[0].direct_distance)
      
      let deliveryFee;
      
      switch(true) {
        case(directDistance >= 0 && directDistance <= 1):
          deliveryFee = 30
          break
        case(directDistance >= 2 && directDistance <= 3):
          deliveryFee = 45
          break
        case(directDistance >= 4 && directDistance <= 5):
          deliveryFee = 59
          break
        case(directDistance == 6):
          deliveryFee = 65
          break
        case(directDistance == 7):
          deliveryFee = 69
          break
        case(directDistance == 8):
          deliveryFee = 79
          break
        case(directDistance == 9):
          deliveryFee = 89
          break
        case(directDistance == 10):
          deliveryFee = 110
          break
        case(directDistance >= 11 && directDistance <= 15):
          deliveryFee = 150
          break
        case(directDistance >= 16 && directDistance <= 20):
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
      
    } else {
      jsonRes = {
        statusCode: 200,
        success: true,
        result: null
      };
    }
  }).catch((error) => {
    console.log(error);
    logger.error(error);

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

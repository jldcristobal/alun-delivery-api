// const log4js = require('log4js');
const config = require('config');

const mysqlDbHelper = require('../../helpers/mysql-db-helper');
const util = require('../../helpers/util');

// const logger = log4js.getLogger('controllers - userEnrollment');
// logger.level = config.logLevel;
console.log('controllers - userEnrollment');

/**
 * Controller object
 */
const userEnrollment = {};

userEnrollment.userEnroll = async (req, res) => {
    // logger.info('inside userEnroll()...');
    // logger.debug('request body to enroll user -');
    // logger.debug(req.body);
    console.log('inside userEnroll()...');

    let jsonRes;

    // user enroll and import 

    const salt = util.getSalt();
    const passwordHash = util.hashPassword(req.body.password, salt);
    
    let userType = req.body.userType
    let organization = userType === 'external' ? '"' + req.body.organization + '"' : null

    // TODO: validate uniqueness of user

    const query = `INSERT INTO users(user_type, organization, username, password, salt) VALUES("${userType}", ${organization}, "${req.body.username}", "${passwordHash}", "${salt}")`
    let addUser = mysqlDbHelper.execute(query)
    
    addUser.then(() => { 
        jsonRes = {
            statusCode: 200,
            success: true,
            message: 'User enrolled successfully'
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

module.exports = userEnrollment;
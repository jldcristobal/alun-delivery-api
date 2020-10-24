// const log4js = require('log4js');
const config = require('config');
const util = require('../../helpers/util');

const User = require('./userEnrollmentModel')

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

    const salt = util.getSalt();
    const passwordHash = util.hashPassword(req.body.password, salt);
    
    let userType = req.body.userType
    let organization = userType === 'external' ? req.body.organization : null
    
    try {
        let [, created] = await User.findOrCreate({
            where: { username: req.body.username },
            defaults: {
                user_type: userType,
                organization: organization,
                username: req.body.username,
                password: passwordHash,
                salt: salt
            }
        })

        if(!created) {
            jsonRes = {
                statusCode: 400,
                success: false,
                message: 'Username already exists'
            };
        } else {
            jsonRes = {
                statusCode: 200,
                success: true,
                message: 'User enrolled successfully'
            }; 
        }
    } catch(error) {
        jsonRes = {
            statusCode: 500,
            success: false,
            error: error,
        };
    }
    util.sendResponse(res, jsonRes);    
};

module.exports = userEnrollment;
const log4js = require('log4js');
const config = require('config');
const jwt = require('jsonwebtoken');

const util = require('../../helpers/util');

const User = require('../user-enrollment/userEnrollmentModel')

// const logger = log4js.getLogger('controllers - accessToken');
// logger.level = config.logLevel;

/**
 * Controller object
 */
const accessToken = {};

accessToken.generateAccessToken = async (req, res) => {
    // logger.debug('inside generateAccessToken()...');
    let jsonRes;

    try {
        const username = req.body.username;
        const getUser = await User.findOne({
            where: { username: username }
        })

        if(getUser === null) {
            jsonRes = {
                errors: [{
                    code: 401,
                    message: 'User credentials are invalid'
                }],
                statusCode: 401
            };
        } else {
            const password = req.body.password;
            let salt = getUser.salt
            const passwordHash = util.hashPassword(password, salt);

            if(passwordHash === getUser.password) {
                let userDetails = {
                    username: getUser.username,
                    userType: getUser.userType,
                    organization: getUser.organization
                };
                // logger.debug('generateAccessToken user authenticated');
                let token = jwt.sign(userDetails, config.tokenSecret, {
                    expiresIn: config.tokenExpriryTime
                });
                jsonRes = {
                    statusCode: 200,
                    success: true,
                    result: token
                };
            } else {
                jsonRes = {
                    errors: [{
                        code: 401,
                        message: 'User credentials are invalid'
                    }],
                    statusCode: 401
                };
            }
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

module.exports = accessToken;
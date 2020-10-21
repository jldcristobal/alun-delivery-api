const log4js = require('log4js');
const config = require('config');
const jwt = require('jsonwebtoken');

const mysqlDbHelper = require('../../helpers/mysql-db-helper');
const util = require('../../helpers/util');

// const logger = log4js.getLogger('controllers - accessToken');
// logger.level = config.logLevel;

/**
 * Controller object
 */
const accessToken = {};

accessToken.generateAccessToken = async (req, res) => {
    // logger.debug('inside generateAccessToken()...');
    let jsonRes;
    const password = req.body.password;
    
    const username = req.body.username;
    let query = `SELECT * FROM users where username = "${username}"`
    let getUser = mysqlDbHelper.execute(query)
    getUser.then((user) => { 
        if(user.length > 0) {
            let salt = user[0].salt
            const passwordHash = util.hashPassword(password, salt);

            if(passwordHash === user[0].password) {
                let userDetails = {
                    username: user[0].username,
                    userType: user[0].userType,
                    organization: user[0].organization
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
        } else {
            jsonRes = {
                errors: [{
                    code: 401,
                    message: 'User credentials are invalid'
                }],
                statusCode: 401
            };
        }
        
    }).catch((error) => {
        console.log(error)
    }).finally(() => {
        util.sendResponse(res, jsonRes);
    })
};

module.exports = accessToken;
const config = require('config')
const { Sequelize } = require('sequelize');

module.exports = new Sequelize(config.database.name, config.database.user, config.database.password, {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    pool: {
      max: 5,
      idle: 30000,
      acquire: 60000,
    },
    logging: false
});




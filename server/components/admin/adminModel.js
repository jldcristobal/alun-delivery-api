const sequelize = require('../../helpers/mysql-db-helper');
const { DataTypes } = require('sequelize');

const Admin = sequelize.define('admin', {
    // Model attributes are defined here
    admin_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    admin_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    subscriber_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    notification_on: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
  }, {
    // Other model options go here
    timestamps: false
  })

  module.exports = Admin
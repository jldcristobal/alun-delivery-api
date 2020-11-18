const sequelize = require('../../helpers/mysql-db-helper');
const { DataTypes } = require('sequelize');

const Orders = sequelize.define('orders', {
    // Model attributes are defined here
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    order_uuid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order_cart: {
        type: DataTypes.STRING,
        allowNull: false
    },
    merchant_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order_platform: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order_confirmed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    order_closed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    merchant_contacts: {
        type: DataTypes.STRING,
        allowNull: false
    },
    confirmed_by: {
        type: DataTypes.STRING,
        allowNull: true
    }
  }, {
    // Other model options go here
    timestamps: false
  })

  module.exports = Orders
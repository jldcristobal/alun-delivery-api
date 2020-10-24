const sequelize = require('../../helpers/mysql-db-helper');
const { DataTypes } = require('sequelize');

const Merchant = require('./merchantModel')

const MerchantContact = sequelize.define('merchant_contact', {
    // Model attributes are defined here
    merchant_contact_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    merchant_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    merchant_contact_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    merchant_contact_email: {
        type: DataTypes.STRING,
        allowNull: false
      }
  }, {
    // Other model options go here
    timestamps: false
  });


  module.exports = MerchantContact
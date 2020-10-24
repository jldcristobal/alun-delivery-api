const sequelize = require('../../helpers/mysql-db-helper');
const { DataTypes } = require('sequelize');

const Merchant = sequelize.define('merchant', {
    // Model attributes are defined here
    merchant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    merchant_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    // Other model options go here
    timestamps: false
  });

  module.exports = Merchant
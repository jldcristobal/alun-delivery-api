const sequelize = require('../../../helpers/mysql-db-helper');
const { DataTypes } = require('sequelize');

const Delivery = sequelize.define('delivery', {
    // Model attributes are defined here
    trackingNumber: {
        type: DataTypes.STRING(11),
        allowNull: false,
        primaryKey: true
    },
    senderName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    senderAddress: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    receiverName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    receiverAddress: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    nearestLandmark: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    receiverNumber: {
        type: DataTypes.STRING(11),
        allowNull: false,
        validate: {
            isNumeric: true
        }
    },
    deliveryDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    }
  });

  module.exports = Delivery
  
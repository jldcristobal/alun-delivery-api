const sequelize = require('../../../helpers/mysql-db-helper');
const { DataTypes } = require('sequelize');

const Delivery = sequelize.define('delivery', {
    // Model attributes are defined here
    deliveryId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    trackingNumber: {
        type: DataTypes.STRING(12),
        allowNull: false,
        unique: true
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
    pickupDatetime: {
        type: DataTypes.DATE
    },
    deliveryDatetime: {
        type: DataTypes.DATE
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    }
  });

  module.exports = Delivery
  
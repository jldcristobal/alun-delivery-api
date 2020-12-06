const sequelize = require('../../../helpers/mysql-db-helper');
const { DataTypes } = require('sequelize');

const Delivery = require('./deliveryModel')

const DeliveryStatus = sequelize.define('delivery_status_history', {
    // Model attributes are defined here
    statusHIstoryId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
          isIn: [['Pending', 'For Pick-up', 'Picked up', 'In transit', 'Delivered', 'Cancelled', 'For RTS', 'In transit for RTS', 'Returned']]
      }
    }
  });

  Delivery.hasMany(DeliveryStatus, {foreignKey: 'deliveryId'})
  DeliveryStatus.belongsTo(Delivery, {foreignKey: 'deliveryId'});

  module.exports = DeliveryStatus
  
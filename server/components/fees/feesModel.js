const sequelize = require('../../helpers/mysql-db-helper');
const { DataTypes } = require('sequelize');

const Fee = sequelize.define('fee', {
    // Model attributes are defined here
    one: {
      type: DataTypes.STRING,
      allowNull: false
    },
    two: {
      type: DataTypes.STRING,
      allowNull: false
    },
    driving_distance: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    direct_distance: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
  }, {
    // Other model options go here
    timestamps: false,
    tableName: 'rinconadaDD'
  });

  module.exports = Fee
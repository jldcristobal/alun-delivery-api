const sequelize = require('../../helpers/mysql-db-helper');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
    // Model attributes are defined here
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    user_type: {
      type: DataTypes.STRING(8),
      allowNull: false
    },
    organization: {
      type: DataTypes.STRING(100)
      // allowNull defaults to true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    salt: {
        type: DataTypes.STRING,
        allowNull: false
    }
  }, {
    // Other model options go here
    timestamps: false
  });

  module.exports = User
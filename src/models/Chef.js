const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chef = sequelize.define(
  'Chef',
  {
    name: { type: DataTypes.STRING(120), allowNull: false },
    specialty: { type: DataTypes.STRING(120) },
  },
  { tableName: 'chefs' }
);

module.exports = Chef;

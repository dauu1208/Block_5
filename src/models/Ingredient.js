const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ingredient = sequelize.define(
  'Ingredient',
  {
    name: { type: DataTypes.STRING(120), allowNull: false },
    unit: { type: DataTypes.STRING(30), allowNull: false },
  },
  { tableName: 'ingredients' }
);

module.exports = Ingredient;

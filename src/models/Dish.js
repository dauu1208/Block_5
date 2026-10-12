const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dish = sequelize.define(
  'Dish',
  {
    name: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    category: { type: DataTypes.STRING(60) },
    available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: 'dishes' }
);

module.exports = Dish;

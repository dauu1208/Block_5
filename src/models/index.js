const sequelize = require('../config/database');
const Dish = require('./Dish');
const Chef = require('./Chef');
const Ingredient = require('./Ingredient');

// Một đầu bếp nấu nhiều món; xóa đầu bếp thì món vẫn còn (chefId = NULL)
Chef.hasMany(Dish, { foreignKey: 'chefId', as: 'dishes', onDelete: 'SET NULL' });
Dish.belongsTo(Chef, { foreignKey: 'chefId', as: 'chef' });

// Món ăn <-> nguyên liệu (nhiều-nhiều); xóa một bên thì bảng nối tự xóa theo
Dish.belongsToMany(Ingredient, {
  through: 'dish_ingredients',
  as: 'ingredients',
  foreignKey: 'dishId',
  otherKey: 'ingredientId',
});
Ingredient.belongsToMany(Dish, {
  through: 'dish_ingredients',
  as: 'dishes',
  foreignKey: 'ingredientId',
  otherKey: 'dishId',
});

module.exports = { sequelize, Dish, Chef, Ingredient };

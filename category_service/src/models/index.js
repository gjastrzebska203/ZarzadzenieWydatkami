const { sequelize } = require('../config/db');
const CategoryModel = require('./category.model');

const Category = CategoryModel(sequelize);

module.exports = {
  sequelize,
  Category,
};

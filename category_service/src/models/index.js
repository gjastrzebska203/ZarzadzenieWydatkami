const { sequelize } = require('../config/db');
const CategoryModel = require('./category.model');

const Category = CategoryModel(sequelize);

Category.hasMany(Category, {
  as: 'subcategories',
  foreignKey: 'parent_category_id',
});

Category.belongsTo(Category, {
  as: 'parent',
  foreignKey: 'parent_category_id',
});

module.exports = {
  sequelize,
  Category,
};

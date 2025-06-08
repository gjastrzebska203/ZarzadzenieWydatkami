const { sequelize } = require('../config/db');
const UserModel = require('./user.model');

const User = UserModel(sequelize);

module.exports = {
  sequelize,
  User,
};

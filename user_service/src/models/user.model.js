const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fullname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('user', 'admin', 'finance-manager'),
        defaultValue: 'user',
        allowNull: false,
      },
      language: {
        type: DataTypes.STRING,
        defaultValue: 'pl',
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: 'PLN',
      },
      isemailverified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      resettoken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resettokenexpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdat: {
        type: DataTypes.DATE,
        field: 'createdat',
      },
      updatedat: {
        type: DataTypes.DATE,
        field: 'updatedat',
      },
    },
    {
      tableName: 'users',
      timestamps: false,
    }
  );

  return User;
};

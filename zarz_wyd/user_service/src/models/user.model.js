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
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
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
      is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reset_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reset_token_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
      updated_at: {
        type: DataTypes.DATE,
        field: 'updated_at',
      },
    },
    {
      tableName: 'users',
      timestamps: false,
      indexes: [
        {
          name: 'idx_reset_token_expiry',
          fields: ['reset_token', 'reset_token_expiry'],
        },
        {
          name: 'idx_email',
          unique: true,
          fields: ['email'],
        },
        {
          name: 'idx_role',
          fields: ['role'],
        },
        {
          name: 'idx_created_at',
          fields: ['created_at'],
        },
      ],
    }
  );

  return User;
};

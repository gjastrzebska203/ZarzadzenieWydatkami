const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define(
    'Category',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      parent_category_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'category',
          key: 'id',
        },
        onDelete: 'SET NULL',
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
      tableName: 'category',
      timestamps: false,
      indexes: [
        {
          fields: ['user_id'],
        },
        {
          fields: ['parent_category_id'],
        },
        {
          fields: ['created_at'],
        },
        {
          unique: true,
          fields: ['user_id', 'name'],
        },
      ],
    }
  );

  return Category;
};

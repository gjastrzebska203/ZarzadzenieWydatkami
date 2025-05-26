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
      userid: {
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
      parentcategoryid: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id',
        },
        onDelete: 'SET NULL',
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
      tableName: 'categories',
      timestamps: false,
    }
  );

  return Category;
};

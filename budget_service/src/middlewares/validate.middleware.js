const { body } = require('express-validator');
const { Category } = require('../../../category_service/src/models');

const validateCreateBudget = [
  body('limits').custom(async (val) => {
    if (!Array.isArray(val)) {
      throw new Error('limits musi być tablicą.');
    }
    const categories = val.map((item) => item.category);
    const uniqueCategories = new Set(categories);
    if (uniqueCategories.size !== categories.length) {
      throw new Error('Kategorie w limits muszą być unikalne.');
    }
    for (const item of val) {
      const keys = Object.keys(item);
      if (keys.length !== 2 || !keys.every((k) => ['category', 'amount'].includes(k))) {
        throw new Error('Każdy element limits musi mieć tylko category i amount.');
      }
      if (
        typeof item.category !== 'string' ||
        typeof item.amount !== 'number' ||
        isNaN(item.amount)
      ) {
        throw new Error('Nieprawidłowe typy danych w limits.');
      }
      const category_db = await Category.findOne({
        where: {
          id: item.category,
        },
      });
      if (!category_db) {
        throw new Error('Kategoria nie istnieje.');
      }
    }
    return true;
  }),

  body('period')
    .optional()
    .isIn(['monthly', 'weekly'])
    .withMessage('Dozwolone wartości to "monthly" lub "weekly"'),
  body('startDate').isDate().withMessage('Data początkowa musi być datą.'),
  body('endDate').isDate().withMessage('Data końcowa musi być datą.'),
];

const validateUpdateBudget = [
  body('limits')
    .optional()
    .custom(async (val) => {
      if (!Array.isArray(val)) {
        throw new Error('limits musi być tablicą.');
      }
      const categories = val.map((item) => item.category);
      const uniqueCategories = new Set(categories);
      if (uniqueCategories.size !== categories.length) {
        throw new Error('Kategorie w limits muszą być unikalne.');
      }
      for (const item of val) {
        const keys = Object.keys(item);
        if (keys.length !== 2 || !keys.every((k) => ['category', 'amount'].includes(k))) {
          throw new Error('Każdy element limits musi mieć tylko category i amount.');
        }
        if (
          typeof item.category !== 'string' ||
          typeof item.amount !== 'number' ||
          isNaN(item.amount)
        ) {
          throw new Error('Nieprawidłowe typy danych w limits.');
        }
        const category_db = await Category.findOne({
          where: {
            id: item.category,
          },
        });
        if (!category_db) {
          throw new Error('Kategoria nie istnieje.');
        }
      }
      return true;
    }),

  body('period')
    .optional()
    .isIn(['monthly', 'weekly'])
    .withMessage('Dozwolone wartości to "monthly" lub "weekly"'),
  body('startDate').optional().isDate().withMessage('Data początkowa musi być datą.'),
  body('endDate').optional().isDate().withMessage('Data końcowa musi być datą.'),
];

const validateAddLimit = [
  body('limits').custom(async (val, { req }) => {
    if (!Array.isArray(val)) {
      throw new Error('limits musi być tablicą.');
    }

    const categories_db = await Category.findAll({
      where: {
        user_id: req.user.id,
      },
    });
    const categories = val.map((item) => item.category).push(categories_db);
    const uniqueCategories = new Set(categories);
    if (uniqueCategories.size !== categories.length) {
      throw new Error(
        'Kategorie w limits muszą być unikalne i nie mogą powtarzać się z zapisanymi już kategoriami.'
      );
    }

    for (const item of val) {
      const keys = Object.keys(item);
      if (keys.length !== 2 || !keys.every((k) => ['category', 'amount'].includes(k))) {
        throw new Error('Każdy element limits musi mieć tylko category i amount.');
      }
      if (
        typeof item.category !== 'string' ||
        typeof item.amount !== 'number' ||
        isNaN(item.amount)
      ) {
        throw new Error('Nieprawidłowe typy danych w limits.');
      }
      const category_db = await Category.findOne({
        where: {
          id: item.category,
        },
      });
      if (!category_db) {
        throw new Error('Kategoria nie istnieje.');
      }
    }
    return true;
  }),
];

module.exports = { validateCreateBudget, validateUpdateBudget, validateAddLimit };

const { body } = require('express-validator');
const axios = require('axios');

const validateCreateBudget = [
  body('limits').custom(async (val, { req }) => {
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

      const token = req.headers.authorization?.split(' ')[1];
      const categories_req = await axios.get(
        `${process.env.CATEGORY_SERVICE_URL}/api/category/${item.category}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const category_db = categories_req.data.category;

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
        const categories_req = await axios.get(
          `${process.env.CATEGORY_SERVICE_URL}/api/category/${item.category}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const category_db = categories_req.data.category;
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

    const token = req.headers.authorization?.split(' ')[1];
    const existingCategories = [];

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

      const categories_req = await axios.get(
        `${process.env.CATEGORY_SERVICE_URL}/api/category/${item.category}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const category_db = categories_req.data.category;
      if (!category_db) {
        throw new Error('Kategoria nie istnieje.');
      }

      existingCategories.push(item.category);
    }

    const uniqueCategories = new Set(existingCategories);
    if (uniqueCategories.size !== existingCategories.length) {
      throw new Error(
        'Kategorie w limits muszą być unikalne i nie mogą powtarzać się z zapisanymi już kategoriami.'
      );
    }

    return true;
  }),
];

module.exports = {
  validateCreateBudget,
  validateUpdateBudget,
  validateAddLimit,
};

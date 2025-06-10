const { body } = require('express-validator');
const axios = require('axios');

const validateCreateExpense = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Nieprawidłowa kwota.'),

  body('categoryId')
    .isString()
    .custom(async (val) => {
      try {
        const response = await axios.get(`${process.env.CATEGORY_SERVICE_URL}/api/category/${val}`);
        if (!response.data) throw new Error();
        return true;
      } catch {
        throw new Error('Brak kategorii w bazie.');
      }
    })
    .withMessage('Błąd kategorii.'),

  body('budgetId')
    .optional()
    .custom(async (val) => {
      try {
        const response = await axios.get(`${process.env.BUDGET_SERVICE_URL}/api/budgets/${val}`);
        if (!response.data) throw new Error();
        return true;
      } catch {
        throw new Error('Brak budżetu.');
      }
    }),

  body('accountId')
    .optional()
    .custom(async (val) => {
      try {
        const response = await axios.get(`${process.env.ACCOUNT_SERVICE_URL}/api/account/${val}`);
        if (!response.data) throw new Error();
        return true;
      } catch {
        throw new Error('Brak rachunku.');
      }
    }),

  body('date').optional().isISO8601().toDate().withMessage('Błędna data.'),
  body('note').optional().isString().withMessage('Błąd notatki.'),
  body('tags').optional().isArray().withMessage('Tagi muszą być tablicą.'),
  body('tags.*').optional().isString().withMessage('Każdy tag musi być tekstem.'),
];

const validateUpdateExpense = [
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Nieprawidłowa kwota.'),

  body('categoryId')
    .isString()
    .custom(async (val) => {
      try {
        const response = await axios.get(`${process.env.CATEGORY_SERVICE_URL}/api/category/${val}`);
        if (!response.data) throw new Error();
        return true;
      } catch {
        throw new Error('Brak kategorii w bazie.');
      }
    })
    .withMessage('Błąd kategorii.'),

  body('budgetId')
    .optional()
    .custom(async (val) => {
      try {
        const response = await axios.get(`${process.env.BUDGET_SERVICE_URL}/api/budgets/${val}`);
        if (!response.data) throw new Error();
        return true;
      } catch {
        throw new Error('Brak budżetu.');
      }
    }),

  body('accountId')
    .optional()
    .custom(async (val) => {
      try {
        const response = await axios.get(`${process.env.ACCOUNT_SERVICE_URL}/api/account/${val}`);
        if (!response.data) throw new Error();
        return true;
      } catch {
        throw new Error('Brak rachunku.');
      }
    }),

  body('date').optional().isISO8601().toDate().withMessage('Błędna data.'),
  body('note').optional().isString().withMessage('Błąd notatki.'),
  body('tags').optional().isArray().withMessage('Tagi muszą być tablicą.'),
  body('tags.*').optional().isString().withMessage('Każdy tag musi być tekstem.'),
];

module.exports = { validateCreateExpense, validateUpdateExpense };

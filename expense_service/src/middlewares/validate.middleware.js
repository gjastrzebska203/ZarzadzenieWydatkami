const { body } = require('express-validator');
const { Category } = require('../../../category_service/src/models');
const { Budget } = require('../../../budget_service/src/models/budget.model');

const validateCreateExpense = [
  body('amount')
    .isNumeric()
    .withMessage('Nieprawidłowa kwota.')
    .custom((val) => {
      if (val === 0.0) {
        throw new Error('Kwota musi być różna od zera.');
      }
      return true;
    }),

  body('categoryId')
    .isString()
    .custom(async (val) => {
      const category = await Category.findOne({
        where: { id: val, userid: req.user.id },
      });
      if (!category) {
        throw new Error('Brak kategorii w bazie.');
      }
      return true;
    })
    .withMessage('Błąd kategorii.'),

  body('budgetId')
    .optional()
    .custom(async (val) => {
      const budget = await Budget.findOne({
        where: { id: val },
      });
      if (!budget) {
        throw new Error('Brak budżetu.');
      }
      return true;
    }),

  body('date').optional().isISO8601().toDate().withMessage('Błędna data.'),
  body('note').optional().isString().withMessage('Błąd notatki.'),
  body('tags').optional().isArray().withMessage('Tagi muszą być tablicą.'),
  body('tags.*').optional().isString().withMessage('Każdy tag musi być tekstem.'),
];

const validateUpdateExpense = [
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Nieprawidłowa kwota.')
    .custom((val) => {
      if (val === 0.0) {
        throw new Error('Kwota musi być różna od zera.');
      }
      return true;
    }),

  body('categoryId')
    .optional()
    .custom(async (val) => {
      const category = await Category.findOne({
        where: { id: val },
      });
      if (!category) {
        throw new Error('Kwota musi być różna od zera.');
      }
    }),

  body('budgetId')
    .optional()
    .custom(async (val) => {
      const budget = await Budget.findOne({
        where: { id: val },
      });
      if (!budget) {
        throw new Error('Brak budżetu.');
      }
      return true;
    }),

  body('date').optional().isISO8601().toDate().withMessage('Błędna data.'),
  body('note').optional().isString().withMessage('Błąd notatki.'),
  body('tags').optional().isArray().withMessage('Tagi muszą być tablicą.'),
  body('tags.*').optional().isString().withMessage('Każdy tag musi być tekstem.'),
];

module.exports = { validateCreateExpense, validateUpdateExpense };

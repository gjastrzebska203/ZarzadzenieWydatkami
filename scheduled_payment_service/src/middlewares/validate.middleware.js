const { body } = require('express-validator');
const { Category } = require('../../../category_service/src/models');
const Budget = require('../../../budget_service/src/models/budget.model');

const validateCreatePayment = [
  body('name').isString().withMessage('Nieprawidłowa nazwa.'),
  body('amount').isFloat({ min: 0 }).withMessage('Nieprawidłowa kwota.'),

  body('categoryId')
    .isString()
    .custom(async (val) => {
      const category = await Category.findOne({
        where: { id: val },
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
      const budget = await Budget.findById(val);
      if (!budget) {
        throw new Error('Brak budżetu.');
      }
      return true;
    }),

  body('frequency')
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Dopuszczalne wartości to: "daily", "weekly", "monthly".'),

  body('dayOfWeek')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Wartość musi być liczbą od 1 do 7.'),

  body('dayOfMonth')
    .optional()
    .isInt({ min: 1, max: 28 })
    .withMessage('Wartość musi być liczbą od 1 do 28.'),

  body('nextPaymentDate').isDate().withMessage('Wartość musi być datą.'),
  body('lastPaymentDate').optional().isDate().withMessage('Wartość musi być datą.'),

  body('remindBeforeDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Wartość musi być liczbą większą od 1.'),

  body('autoExecute').optional().isBoolean().withMessage('Wartość musi być true lub false.'),
  body('isActive').optional().isBoolean().withMessage('Wartość musi być true lub false.'),
];

const validateUpdatePayment = [
  body('name').isString().withMessage('Nieprawidłowa nazwa.'),
  body('amount').isFloat({ min: 0 }).withMessage('Nieprawidłowa kwota.'),

  body('categoryId')
    .optional()
    .isString()
    .custom(async (val) => {
      const category = await Category.findOne({
        where: { id: val },
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
      const budget = await Budget.findById(val);
      if (!budget) {
        throw new Error('Brak budżetu.');
      }
      return true;
    }),

  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Dopuszczalne wartości to: "daily", "weekly", "monthly".'),

  body('dayOfWeek')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Wartość musi być liczbą od 1 do 7.'),

  body('dayOfMonth')
    .optional()
    .isInt({ min: 1, max: 28 })
    .withMessage('Wartość musi być liczbą od 1 do 28.'),

  body('nextPaymentDate').optional().isDate().withMessage('Wartość musi być datą.'),
  body('lastPaymentDate').optional().isDate().withMessage('Wartość musi być datą.'),

  body('remindBeforeDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Wartość musi być liczbą większą od 1.'),

  body('autoExecute').optional().isBoolean().withMessage('Wartość musi być true lub false.'),
  body('isActive').optional().isBoolean().withMessage('Wartość musi być true lub false.'),
];

module.exports = { validateCreatePayment, validateUpdatePayment };

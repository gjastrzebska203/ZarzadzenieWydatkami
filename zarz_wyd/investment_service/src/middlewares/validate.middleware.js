const { body } = require('express-validator');

const validateCreateInvestment = [
  body('name').isString().withMessage('Nazwa inwestycji musi być napisem.'),
  body('targetAmount')
    .isFloat({ min: 0 })
    .withMessage('Kwota docelowa inwestycji musi być liczbą większą od 0.'),
  body('currentAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Kwota początkowa inwestycji musi być liczbą.'),
  body('interestRate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Procent musi być liczbą większą lub równą 0 i mniejszą lub równą 1.'),

  body('targetDate')
    .isDate()
    .withMessage('Data końcowa musi być datą.')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Data zakończenia musi być w przyszłości.');
      }
      return true;
    }),
];

const validateUpdateInvestment = [
  body('name').optional().isString().withMessage('Nazwa inwestycji musi być napisem.'),
  body('targetAmount').optional().isInt().withMessage('Kwota docelowa inwestycji musi być liczbą.'),
  body('currentAmount').optional().isInt('Kwota początkowa inwestycji musi być liczbą.'),
  body('interestRate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Procent musi być liczbą większą lub równą 0 i mniejszą lub równą 1.'),

  body('targetDate')
    .optional()
    .isDate()
    .custom((value) => {
      if (new Date() <= value) {
        throw new Error('Data zakończenia musi być w przyszłości.');
      }
      return true;
    })
    .withMessage('Data końcowa musi być datą.'),
];

module.exports = { validateCreateInvestment, validateUpdateInvestment };

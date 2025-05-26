const { body } = require('express-validator');

const validateExpense = [
  body('amount')
    .isNumeric()
    .withMessage('Nieprawidłowa kwota.')
    .custom((val) => {
      if (val === 0.0) {
        throw new Error('Kwota musi być różna od zera.');
      }
      return true;
    }),
  body('categoryId').isString().withMessage('Błąd kategorii.'),
  body('date').optional().isISO8601().toDate().withMessage('Błędna data.'),
  body('note').optional().isString().withMessage('Błąd notatki.'),
  body('tags').optional().isArray().withMessage('Tagi muszą być tablicą.'),
  body('tags.*').optional().isString().withMessage('Każdy tag musi być tekstem.'),
];

module.exports = { validateExpense };

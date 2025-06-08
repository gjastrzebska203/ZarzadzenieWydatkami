const { body } = require('express-validator');

const validateCreateReport = [
  body('from').isDate().withMessage('Błąd typu.'),
  body('to').isDate().withMessage('Błąd typu.'),
];

module.exports = { validateCreateReport };

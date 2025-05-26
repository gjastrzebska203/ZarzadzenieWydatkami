const { body } = require('express-validator');

const validateCreateCategory = [
  body('name').isString().withMessage('Nieprawidłowa nazwa.'),
  body('color').isString().withMessage('Nieprawidłowy kolor.'),
  body('icon').isString().withMessage('Nieprawidłowa ikona.'),
];

const validateUpdateCategory = [
  body('name').isString().withMessage('Nieprawidłowa nazwa.'),
  body('color').isString().withMessage('Nieprawidłowy kolor.'),
  body('icon').isString().withMessage('Nieprawidłowa ikona.'),
];

module.exports = { validateCreateCategory, validateUpdateCategory };

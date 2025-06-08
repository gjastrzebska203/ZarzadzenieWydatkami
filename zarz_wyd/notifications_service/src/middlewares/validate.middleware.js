const { body } = require('express-validator');

const validateCreateNotification = [
  body('type')
    .isIn(['budget', 'payment', 'expense', 'suggestion'])
    .withMessage('Dozwolone wartości to "budget", "payment", "expense", "suggestion".'),

  body('title').isString().withMessage('Tytuł powiadomienia musi być napisem.'),
  body('message').isString().withMessage('Opis powiadomienia musi być napisem.'),
];

const validateUpdateNotification = [
  body('type')
    .optional()
    .isIn(['budget', 'payment', 'expense', 'suggestion'])
    .withMessage('Dozwolone wartości to "budget", "payment", "expense", "suggestion".'),

  body('title').optional().isString().withMessage('Tytuł powiadomienia musi być napisem.'),
  body('message').optional().isString().withMessage('Opis powiadomienia musi być napisem.'),
  body('isRead')
    .optional()
    .isBoolean()
    .withMessage('Status powiadomienia musi być wartościa true lub false.'),
];

module.exports = { validateCreateNotification, validateUpdateNotification };

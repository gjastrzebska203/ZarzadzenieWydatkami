const { body } = require('express-validator');
const { currencyCodes } = require('../config/data');
const Account = require('../models/account.model');
const validateCreateAccount = [
  body('name').isString().withMessage('Nazwa rachunku musi być napisem.'),

  body('type')
    .isString()
    .isIn(['cash', 'card', 'bank', 'e-wallet'])
    .withMessage('Dozwolone wartości to "cash", "card", "bank", "e-wallet".'),

  body('currency')
    .isString()
    .custom((val) => {
      if (!currencyCodes.includes(val.toUpperCase())) {
        throw new Error('Błędny kod walutowy.');
      }
      return true;
    }),

  body('balance').isFloat().optional().withMessage('Balans musi być liczbą.'),
  body('isActive')
    .isBoolean()
    .optional()
    .withMessage('Status aktywności musi być wartością true lub false.'),
];

const validateUpdateAccount = [
  body('name').optional().isString().withMessage('Nazwa rachunku musi być napisem.'),

  body('type')
    .optional()
    .isString()
    .isIn(['cash', 'card', 'bank', 'e-wallet'])
    .withMessage('Dozwolone wartości to "cash", "card", "bank", "e-wallet".'),

  body('currency')
    .optional()
    .custom((val) => {
      if (!currencyCodes.includes(val.toUpperCase())) {
        throw new Error('Błędny kod walutowy.');
      }
      return true;
    }),

  body('balance').isFloat().optional().withMessage('Balans musi być liczbą.'),
  body('isActive').isBoolean().optional('Status aktywności musi być wartością true lub false.'),
];

const validateTransferFunds = [
  body('fromAccountId')
    .custom(async (val) => {
      console.log(val);
      const account = await Account.findOne({ _id: val });
      if (!account) {
        throw new Error('Konto docelowe nie istnieje.');
      }
      return true;
    })
    .withMessage('Błędny numer konta źródłowego.'),

  body('toAccountId')
    .custom(async (val) => {
      const account = await Account.findOne({ _id: val });
      if (!account) {
        throw new Error('Konto docelowe nie istnieje.');
      }
      return true;
    })
    .withMessage('Błędny numer konta docelowego.'),

  body('amount').isFloat({ min: 0.01 }).withMessage('Kwota musi być większa od zera.'),
];

module.exports = {
  validateCreateAccount,
  validateUpdateAccount,
  validateTransferFunds,
};

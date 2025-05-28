const { body } = require('express-validator');
const { currencyCodes, languageCodes } = require('../config/data');
const { User } = require('../models');

const validateRegister = [
  body('email').isEmail().withMessage('Nieprawidłowy email.'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Hasło musi zawierać co najmniej 6 znaków.')
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).*$/)
    .withMessage(
      'Hasło musi zawierać co najmniej jedną wielką literę, jedną cyfrę i jeden znak specjalny oraz nie może zawierać spacji.'
    ),

  body('full_name').notEmpty().withMessage('Imię i nazwisko są wymagane.'),

  body('currency')
    .optional()
    .custom((val) => {
      if (!currencyCodes.includes(val.toUpperCase())) {
        throw new Error('Błędny kod walutowy.');
      }
      return true;
    }),

  body('language')
    .optional()
    .custom((val) => {
      if (!languageCodes.includes(val.toLowerCase())) {
        throw new Error('Błędny kod językowy.');
      }
      return true;
    }),
];

const validateLogin = [
  body('email').isEmail().withMessage('Nieprawidłowy email.'),

  body('password').notEmpty().withMessage('Hasło jest wymagane.'),
];

const validateUpdateProfile = [
  body('email')
    .optional()
    .custom(async (val, { req }) => {
      const existingUser = await User.findOne({ where: { val } });
      if (existingUser && existingUser.id !== req.user.id) {
        throw new Error('Podany email jest już zajęty');
      }
      return true;
    })
    .isEmail()
    .withMessage('Nieprawidłowy email.'),

  body('full_name').optional().notEmpty().withMessage('Imię i nazwisko są wymagane.'),

  body('currency')
    .optional()
    .optional()
    .custom((val) => {
      if (!currencyCodes.includes(val.toUpperCase())) {
        throw new Error('Błędny kod walutowy.');
      }
      return true;
    }),

  body('language')
    .optional()
    .optional()
    .custom((val) => {
      if (!languageCodes.includes(val.toLowerCase())) {
        throw new Error('Błędny kod językowy.');
      }
      return true;
    }),
];

const validateChangePassword = [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Hasło musi zawierać co najmniej 6 znaków.')
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).*$/)
    .withMessage(
      'Hasło musi zawierać co najmniej jedną wielką literę, jedną cyfrę i jeden znak specjalny oraz nie może zawierać spacji.'
    ),
];

module.exports = { validateRegister, validateLogin, validateUpdateProfile, validateChangePassword };

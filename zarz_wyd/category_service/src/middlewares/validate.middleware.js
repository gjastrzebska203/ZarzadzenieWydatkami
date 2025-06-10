const { body } = require('express-validator');
const { Category } = require('../models');

const validateCreateCategory = [
  body('name').isString().withMessage('Nieprawidłowa nazwa.'),
  body('color').isString().withMessage('Nieprawidłowy kolor.'),
  body('icon').isString().withMessage('Nieprawidłowa ikona.'),

  body('parent_category_id')
    .optional()
    .custom(async (val, { req }) => {
      const category = await Category.findOne({
        where: { id: val, user_id: req.user.id },
      });
      if (!category) {
        throw new Error('Brak kategorii w bazie.');
      }
      return true;
    })
    .isString()
    .withMessage('Nieprawidłowa kategoria nadrzędna.'),
];

const validateUpdateCategory = [
  body('name').optional().isString().withMessage('Nieprawidłowa nazwa.'),
  body('color').optional().isString().withMessage('Nieprawidłowy kolor.'),
  body('icon').optional().isString().withMessage('Nieprawidłowa ikona.'),

  body('parent_category_id')
    .optional()
    .custom(async (val) => {
      const category = await Category.findOne({
        where: { id: val, user_id: req.user.id },
      });
      if (!category) {
        throw new Error('Brak kategorii w bazie.');
      }
      return true;
    })
    .isString()
    .withMessage('Nieprawidłowa kategoria nadrzędna.'),
];

module.exports = { validateCreateCategory, validateUpdateCategory };

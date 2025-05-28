const { body } = require('express-validator');
const { Category } = require('../../../category_service/src/models');

const validateCreateCategory = [
  body('name').isString().withMessage('Nieprawidłowa nazwa.'),
  body('color').isString().withMessage('Nieprawidłowy kolor.'),
  body('icon').isString().withMessage('Nieprawidłowa ikona.'),

  body('parent_category_id')
    .optional()
    .custom(async (val) => {
      const category = await Category.findOne({
        where: { id: val, userid: req.user.id },
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
  body('name').isString().withMessage('Nieprawidłowa nazwa.'),
  body('color').isString().withMessage('Nieprawidłowy kolor.'),
  body('icon').isString().withMessage('Nieprawidłowa ikona.'),

  body('parent_category_id')
    .optional()
    .custom(async (val) => {
      const category = await Category.findOne({
        where: { id: val, userid: req.user.id },
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

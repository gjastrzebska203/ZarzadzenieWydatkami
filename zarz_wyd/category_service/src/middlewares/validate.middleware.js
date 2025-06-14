const { body } = require('express-validator');
const { Category } = require('../models');

const validateCreateCategory = [
  body('name').isString().withMessage('Nieprawidłowa nazwa.'),
  body('color').isString().withMessage('Nieprawidłowy kolor.'),
  body('icon').isString().withMessage('Nieprawidłowa ikona.'),

  body('parent_category_id')
    .optional()
    .isUUID()
    .custom(async (val, { req }) => {
      const category = await Category.findOne({
        where: { id: val, user_id: req.user.id },
      });
      if (!category) {
        throw new Error('Brak kategorii w bazie.');
      }
      if (category.parent_category_id !== null) {
        throw new Error('Podkategoria nie może mieć podkategorii.');
      }
      return true;
    })
    .withMessage('Nieprawidłowa kategoria nadrzędna.'),
];

const validateUpdateCategory = [
  body('name').optional().isString().withMessage('Nieprawidłowa nazwa.'),
  body('color').optional().isString().withMessage('Nieprawidłowy kolor.'),
  body('icon').optional().isString().withMessage('Nieprawidłowa ikona.'),

  body('parent_category_id')
    .optional()
    .isUUID()
    .custom(async (val) => {
      const category = await Category.findOne({
        where: { id: val, user_id: req.user.id },
      });
      if (!category) {
        throw new Error('Brak kategorii w bazie.');
      }
      if (category.parent_category_id !== null) {
        throw new Error('Podkategoria nie może mieć podkategorii.');
      }
      return true;
    })
    .withMessage('Nieprawidłowa kategoria nadrzędna.'),
];

module.exports = { validateCreateCategory, validateUpdateCategory };

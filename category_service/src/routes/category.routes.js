const express = require('express');
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const {
  validateCreateCategory,
  validateUpdateCategory,
} = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', validateCreateCategory, createCategory);
router.get('/', getCategories);
router.put('/:id', validateUpdateCategory, updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;

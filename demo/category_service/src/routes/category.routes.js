const express = require('express');
const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');
const {
  createCategory,
  getCategories,
  getCategoryById,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const {
  validateCreateCategory,
  validateUpdateCategory,
} = require('../middlewares/validate.middleware');

const router = express.Router();
router.use(authenticate);

router.post('/', validateCreateCategory, createCategory);
router.get('/', getCategories);
router.get('/all/categories', authorizeRole('admin'), getAllCategories);
router.get('/:id', getCategoryById);
router.put('/:id', validateUpdateCategory, updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;

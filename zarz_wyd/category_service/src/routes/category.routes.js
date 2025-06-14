const express = require('express');
const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');
const {
  createCategory,
  getCategories,
  getCategoryById,
  getCategoriesByIds,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const {
  validateCreateCategory,
  validateUpdateCategory,
} = require('../middlewares/validate.middleware');

const router = express.Router();
// router.use(authenticate);

router.post('/', authenticate, validateCreateCategory, createCategory);
router.post('/batch', authenticate, getCategoriesByIds);
router.get('/', authenticate, getCategories);
router.get('/all/categories', authenticate, authorizeRole('admin'), getAllCategories);
router.get('/:id', authenticate, getCategoryById);
router.put('/:id', authenticate, validateUpdateCategory, updateCategory);
router.delete('/:id', authenticate, deleteCategory);
router.get('/get/crash', (req, res, next) => {
  throw new Error('Symulowany crash aplikacji');
});

module.exports = router;

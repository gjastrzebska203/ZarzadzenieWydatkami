const express = require('express');
const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');
const {
  createBudget,
  getBudgets,
  getBudget,
  getAllBudgets,
  getSavingSuggestions,
  updateBudget,
  addLimit,
  checkBudgetLimits,
  deleteBudget,
  deleteLimit,
  getBudgetSummary,
} = require('../controllers/budget.controller');
const {
  validateCreateBudget,
  validateUpdateBudget,
  validateAddLimit,
} = require('../middlewares/validate.middleware');

const router = express.Router();

router.post('/', authenticate, validateCreateBudget, createBudget);
router.get('/', authenticate, getBudgets);
router.get('/:id', authenticate, getBudget);
router.get('/all/budgets', authenticate, authorizeRole('admin'), getAllBudgets);
router.get('/get/summary', authenticate, getBudgetSummary);
router.get('/saving/suggestions', authenticate, getSavingSuggestions);
router.put('/:id', authenticate, validateUpdateBudget, updateBudget);
router.post('/:id/limits', authenticate, validateAddLimit, addLimit);
router.get('/:id/check-limits', authenticate, checkBudgetLimits);
router.delete('/:id', authenticate, deleteBudget);
router.delete('/:id/limit/:category', authenticate, deleteLimit);
router.get('/get/crash', (req, res, next) => {
  throw new Error('Symulowany crash aplikacji');
});

module.exports = router;

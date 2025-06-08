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
router.use(authenticate);

router.post('/', validateCreateBudget, createBudget);
router.get('/', getBudgets);
router.get('/:id', getBudget);
router.get('/all/budgets', authorizeRole('admin'), getAllBudgets);
router.get('/get/summary', getBudgetSummary);
router.get('/saving/suggestions', getSavingSuggestions);
router.put('/:id', validateUpdateBudget, updateBudget);
router.post('/:id/limits', validateAddLimit, addLimit);
router.get('/:id/check-limits', checkBudgetLimits);
router.delete('/:id', deleteBudget);
router.delete('/:id/limit/:category', deleteLimit);

module.exports = router;

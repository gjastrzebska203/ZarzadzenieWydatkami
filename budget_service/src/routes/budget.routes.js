const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  addLimit,
  deleteBudget,
  deleteLimit,
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
router.put('/:id', validateUpdateBudget, updateBudget);
router.put('/:id/limits', validateAddLimit, addLimit);
router.delete('/:id', deleteBudget);
router.delete('/:id/limits/:category', deleteLimit);

module.exports = router;

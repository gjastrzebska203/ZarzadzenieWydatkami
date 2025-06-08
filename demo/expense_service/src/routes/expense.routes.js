const express = require('express');
const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');
const {
  createExpense,
  getExpenses,
  getExpense,
  getExpenseSummary,
  getAllExpenses,
  checkForUnusualExpenses,
  updateExpense,
  deleteExpense,
} = require('../controllers/expense.controller');
const {
  validateCreateExpense,
  validateUpdateExpense,
} = require('../middlewares/validate.middleware');

const router = express.Router();
router.use(authenticate);

router.post('/', validateCreateExpense, createExpense);
router.get('/', getExpenses);
router.get('/:id', getExpense);
router.get('/all/expenses', authorizeRole('admin'), getAllExpenses);
router.get('/get/summary', getExpenseSummary);
router.get('/unusual/check', checkForUnusualExpenses);
router.put('/:id', validateUpdateExpense, updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;

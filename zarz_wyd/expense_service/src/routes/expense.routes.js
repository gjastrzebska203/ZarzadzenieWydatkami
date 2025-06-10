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
// router.use(authenticate);

router.post('/', authenticate, validateCreateExpense, createExpense);
router.get('/', authenticate, getExpenses);
router.get('/:id', authenticate, getExpense);
router.get('/all/expenses', authorizeRole('admin'), getAllExpenses);
router.get('/get/summary', authenticate, getExpenseSummary);
router.get('/unusual/check', authenticate, checkForUnusualExpenses);
router.put('/:id', authenticate, validateUpdateExpense, updateExpense);
router.delete('/:id', authenticate, deleteExpense);
router.get('/get/crash', (req, res, next) => {
  throw new Error('Symulowany crash aplikacji');
});

module.exports = router;

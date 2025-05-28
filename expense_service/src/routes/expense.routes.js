const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  createExpense,
  getExpenses,
  getExpense,
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
router.put('/:id', validateUpdateExpense, updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;

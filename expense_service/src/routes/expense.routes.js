const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expense.controller');

const { authenticate } = require('../middlewares/auth.middleware');
// const upload = require('../middlewares/upload.middleware');

router.post('/', authenticate, createExpense);
router.get('/', authenticate, getExpenses);
router.get('/:id', authenticate, getExpense);
router.put('/:id', authenticate, updateExpense);
router.delete('/:id', authenticate, deleteExpense);

module.exports = router;

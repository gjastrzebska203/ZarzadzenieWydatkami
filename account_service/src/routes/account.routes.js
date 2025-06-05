const express = require('express');
const {
  createAccount,
  getAccounts,
  getAccount,
  getTotalBalance,
  updateAccount,
  deleteAccount,
  transferFunds,
} = require('../controllers/account.controller');
const {
  validateCreateAccount,
  validateUpdateAccount,
  validateTransferFunds,
} = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate);

router.post('/', validateCreateAccount, createAccount);
router.get('/', getAccounts);
router.get('/:id', getAccount);
router.get('/total/balance', getTotalBalance);
router.put('/:id', validateUpdateAccount, updateAccount);
router.delete('/:id', deleteAccount);
router.post('/transfer', validateTransferFunds, transferFunds);

module.exports = router;

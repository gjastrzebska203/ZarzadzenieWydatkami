const express = require('express');
const {
  createAccount,
  getAccounts,
  getAccount,
  getAllAccounts,
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
const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');

const router = express.Router();
// router.use(authenticate);

router.post('/', authenticate, validateCreateAccount, createAccount);
router.get('/', authenticate, getAccounts);
router.get('/all/accounts', authorizeRole('admin'), getAllAccounts);
router.get('/:id', authenticate, getAccount);
router.get('/total/balance', authenticate, getTotalBalance);
router.put('/:id', authenticate, validateUpdateAccount, updateAccount);
router.delete('/:id', authenticate, deleteAccount);
router.post('/transfer', authenticate, validateTransferFunds, transferFunds);
router.get('/get/crash', (req, res, next) => {
  throw new Error('Symulowany crash aplikacji');
});

module.exports = router;

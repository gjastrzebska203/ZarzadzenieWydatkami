const express = require('express');
const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  getUsers,
  updateProfile,
  changePassword,
  deleteAccount,
} = require('../controllers/user.controller');
const {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateUpdateProfile,
  validateResetPassword,
  validateForgotPassword,
} = require('../middlewares/validate.middleware');

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.get('/', authenticate, authorizeRole('admin'), getUsers);
router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, validateUpdateProfile, updateProfile);
router.put('/change-password', authenticate, validateChangePassword, changePassword);
router.delete('/me', authenticate, deleteAccount);
router.get('/get/crash', (req, res, next) => {
  throw new Error('Symulowany crash aplikacji');
});

module.exports = router;

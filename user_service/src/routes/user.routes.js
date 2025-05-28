const express = require('express');
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require('../controllers/user.controller');
const {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateUpdateProfile,
} = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, validateUpdateProfile, updateProfile);
router.put('/change-password', authenticate, validateChangePassword, changePassword);
router.delete('/me', authenticate, deleteAccount);

module.exports = router;

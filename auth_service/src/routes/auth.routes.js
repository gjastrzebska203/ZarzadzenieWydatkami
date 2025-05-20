const express = require('express');
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getUsers,
} = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../middlewares/validate.middleware');

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/users', getUsers);

module.exports = router;

const express = require('express');
const { registerUser, loginUser, getUsers } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../middlewares/validate.middleware');

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/users', getUsers);

module.exports = router;

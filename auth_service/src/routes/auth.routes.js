const express = require('express');
const { registerUser, getUsers } = require('../controllers/auth.controller');
const { validateRegister } = require('../middlewares/validate.middleware');

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.get('/users', getUsers);

module.exports = router;

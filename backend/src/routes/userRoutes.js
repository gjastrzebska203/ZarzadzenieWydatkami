// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

router.post('/sign-up', userController.signUpUser);

module.exports = router;

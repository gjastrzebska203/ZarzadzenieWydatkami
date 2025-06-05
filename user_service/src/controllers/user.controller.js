const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { sendResetEmail } = require('../utils/mailer');
const { Op } = require('sequelize');

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      full_name,
      language,
      currency,
    });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '5h',
    });
    return res.status(201).json({
      message: 'Utworzono konto.',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    const error = new Error('Błąd rejestracji');
    error.details = err.message;
    next(error);
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error('Nieprawdiłowy email lub hasło');
      error.details = err.message;
      next(error);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Nieprawdiłowy email lub hasło');
      error.details = err.message;
      next(error);
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '5h',
    });
    res.status(200).json({
      message: 'Zalogowano pomyślnie.',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    const error = new Error('Błąd logowania');
    error.details = err.message;
    next(error);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error('Konto nie znalezione');
      error.details = err.message;
      next(error);
    }
    const token = uuidv4();
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    user.reset_token = token;
    user.reset_token_expiry = expiry;
    await user.save();
    await sendResetEmail(user.email, token);
    res.status(200).json({ message: 'Wysłano link resetujący.', token: token });
  } catch (err) {
    const error = new Error('Błąd forgot password');
    error.details = err.message;
    next(error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: {
          [Op.gt]: new Date(),
        },
      },
    });
    if (!user) {
      const error = new Error('Konto nie znalezione, nieprawidłowy lub wygasły token');
      error.details = err.message;
      next(error);
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.reset_token = null;
    user.reset_tokenexpiry = null;
    await user.save();
    return res.status(200).json({ message: 'Hasło zostało zmienione.' });
  } catch (err) {
    const error = new Error('Błąd reset password');
    error.details = err.message;
    next(error);
  }
};

const getProfile = async (req, res) => {
  const { id, email, full_name, role, language, currency } = req.user;
  res.status(200).json({ id, email, full_name, role, language, currency });
};

const getUsers = async (req, res) => {
  const { id, email, full_name, role, language, currency } = req.user;
  res.status(200).json({ id, email, full_name, role, language, currency });
};

const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const { email, full_name, language, currency } = req.body;
    req.user.email = email || req.user.email;
    req.user.full_name = full_name || req.user.full_name;
    req.user.language = language || req.user.language;
    req.user.currency = currency || req.user.currency;
    await req.user.save();
    res.status(200).json({ message: 'Zaktualizowano pomyślnie.', user: req.user });
  } catch (err) {
    const error = new Error('Błąd aktualizacji profilu');
    error.details = err.message;
    next(error);
  }
};

const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const { currentPassword, newPassword } = req.body;
    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      const error = new Error('Nieprawidłowe obecne hasło');
      error.details = err.message;
      next(error);
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    req.user.password = hashed;
    await req.user.save();
    res.status(200).json({ message: 'Hasło zmienione' });
  } catch (err) {
    const error = new Error('Błąd zmiany hasła');
    error.details = err.message;
    next(error);
  }
};

const deleteAccount = async (req, res) => {
  try {
    await req.user.destroy();
    res.status(200).json({ message: 'Konto zostało usunięte.' });
  } catch (err) {
    const error = new Error('Błąd usuwania konta');
    error.details = err.message;
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  getUsers,
  updateProfile,
  changePassword,
  deleteAccount,
};

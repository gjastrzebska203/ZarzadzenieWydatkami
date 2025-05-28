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
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, full_name, language, currency } = req.body;

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
  } catch (error) {
    console.error('Błąd rejestracji: ' + error);
    return res.status(500).json({ message: 'Błąd rejestracji.' });
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Nieprawidłowy email lub hasło.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });
    }
    const token = jwt.sign({ id: user.id, le: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
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
  } catch (error) {
    console.error('Błąd logowania: ' + error);
    return res.status(500).json({ message: 'Błąd logowania.' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).message({ message: 'Konto nie istnieje.' });
    }
    const token = uuidv4();
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    user.reset_token = token;
    user.reset_token_expiry = expiry;
    await user.save();
    await sendResetEmail(user.email, token);
    res.status(200).json({ message: 'Wysłano link resetujący.', token: token });
  } catch (error) {
    console.error('Błąd forgotPassword: ' + error);
    return res.status(500).json({ message: 'Błąd forgotPassword.' });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: {
          [Op.gt]: new Date(),
        },
      },
    });
    if (!user) {
      return res.status(400).json({ message: 'Nieprawidłowy lub wygasły token.' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.reset_token = null;
    user.reset_tokenexpiry = null;
    await user.save();
    return res.status(200).json({ message: 'Hasło zostało zmienione.' });
  } catch (error) {
    console.error('Błąd resetPassword: ' + error);
    return res.status(500).json({ message: 'Błąd resetPassword.' });
  }
};

const getProfile = async (req, res) => {
  const { id, email, full_name, role, language, currency } = req.user;
  res.status(200).json({ id, email, full_name, role, language, currency });
};

const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, full_name, language, currency } = req.body;
  try {
    req.user.email = email || req.user.email;
    req.user.full_name = full_name || req.user.full_name;
    req.user.language = language || req.user.language;
    req.user.currency = currency || req.user.currency;
    await req.user.save();
    res.status(200).json({ message: 'Zaktualizowano pomyślnie.', user: req.user });
  } catch (error) {
    console.error('Błąd aktualizacji profilu: ' + error);
    return res.status(500).json({ message: 'Błąd aktualizacji profilu.' });
  }
};

const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) return res.status(400).json({ message: 'Nieprawidłowe obecne hasło' });
    const hashed = await bcrypt.hash(newPassword, 10);
    req.user.password = hashed;
    await req.user.save();
    res.json({ message: 'Hasło zmienione' });
  } catch (error) {
    console.error('Błąd zmiany hasła: ' + error);
    return res.status(500).json({ message: 'Błąd zmiany hasła.' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    await req.user.destroy();
    res.status(200).json({ message: 'Konto zostało usunięte.' });
  } catch (error) {
    console.error('Błąd usuwania konta: ' + error);
    return res.status(500).json({ message: 'Błąd usuwania konta.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};

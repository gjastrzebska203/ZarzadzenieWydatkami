const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, fullname, language, currency } = req.body;

  try {
    const existsingUser = await User.findOne({ where: { email } });
    if (existsingUser) {
      return res.status(400).json({ message: 'Email jest już zajęty.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      fullname,
      language,
      currency,
    });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.status(201).json({
      message: 'Utworzono konto.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Błąd serwera.' });
  }
};

const getUsers = async (req, res) => {
  return res.status(200).json({ message: 'działa' });
};

module.exports = { registerUser, getUsers };

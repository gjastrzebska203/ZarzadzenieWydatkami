const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticate = require("../middlewares/auth");
const router = express.Router();

const signUpUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Wszystkie pola są wymagane" });
    }

    const existingUser = await UserModel.findOne({ where: { email: email} });
    // const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Użytkownik z tym adresem email już istnieje" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new UserModel({ email, password: hashedPassword, role: 'user' });
    await user.save();

    res.status(201).json({ message: "Rejestracja zakończona sukcesem" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = signUpUser;
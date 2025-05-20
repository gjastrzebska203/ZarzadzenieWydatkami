const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Brak tokenu' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: 'Użytkownik nie znaleziony' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Nieprawidłowy token' });
  }
};

module.exports = { authenticate };

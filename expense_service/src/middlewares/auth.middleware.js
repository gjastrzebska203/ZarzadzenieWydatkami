const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // console.log('Authorization');
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Brak tokenu' });

  const token = authHeader.split(' ')[1];
  // console.log(token);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    req.user = { id: decoded.id };
    // console.log(req.user);
    // console.log(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Nieprawidłowy token' });
  }
};

module.exports = { authenticate };

const jwt = require('jsonwebtoken');
const authenticate = require('../src/middlewares/auth.middleware');

test('tworzy poprawny JWT', () => {
  const payload = { id: '123', role: 'admin' };
  const token = jwt.sign(payload, 'testsecret', { expiresIn: '1h' });

  const decoded = jwt.verify(token, 'testsecret');
  expect(decoded.id).toBe('123');
  expect(decoded.role).toBe('admin');
});

const errorHandler = (err, req, res) => {
  console.log('[ERROR]', err.stack || err);

  const status = err.status || 500;
  const message = err.message || 'Coś poszło nie tak.';

  res.status(status).json({
    message,
    details: err.details || null,
  });
};

module.exports = errorHandler;

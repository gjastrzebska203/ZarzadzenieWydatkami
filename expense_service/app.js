const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const expenseRoutes = require('./src/routes/expense.routes');
const errorHandler = require('./src/middlewares/errorHandler');
const rateLimit = require('express-rate-limit');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100, // maksymalnie 100 żądań/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Za dużo żądań. Spróbuj za chwilę.',
  },
});

app.use(limiter);

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use('/api/expense', expenseRoutes);
app.use(errorHandler);

module.exports = app;

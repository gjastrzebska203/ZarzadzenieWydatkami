const express = require('express');
const Bugsnag = require('@bugsnag/js');
const BugsnagPluginExpress = require('@bugsnag/plugin-express');
const cors = require('cors');
const helmet = require('helmet');
const budgetRoutes = require('./routes/budget.routes');
const errorHandler = require('./middlewares/errorHandler');
const rateLimit = require('express-rate-limit');

Bugsnag.start({
  apiKey: process.env.BUGSNAG_API_KEY,
  plugins: [BugsnagPluginExpress],
  releaseStage: process.env.NODE_ENV || 'development',
});

const bugsnagMiddleware = Bugsnag.getPlugin('express');

const app = express();

app.set('trust proxy', 1);
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
app.use(helmet());
app.use(express.json());

app.use(bugsnagMiddleware.requestHandler);
app.get('/check/health', (req, res) => res.sendStatus(200));
app.use('/api/budget', budgetRoutes);
app.use(bugsnagMiddleware.errorHandler);
app.use(errorHandler);

module.exports = app;

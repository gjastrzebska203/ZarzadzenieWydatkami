const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const investmentRoutes = require('./src/routes/investment.routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/investment', investmentRoutes);
app.use(errorHandler);

module.exports = app;

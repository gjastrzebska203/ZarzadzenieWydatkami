const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const accountRoutes = require('./src/routes/account.routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/account', accountRoutes);
app.use(errorHandler);

module.exports = app;

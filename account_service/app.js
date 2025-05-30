const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const accountRoutes = require('./src/routes/account.routes');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/account', accountRoutes);

module.exports = app;

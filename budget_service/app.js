const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const budgetRoutes = require('./src/routes/budget.routes');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/budget', budgetRoutes);

module.exports = app;

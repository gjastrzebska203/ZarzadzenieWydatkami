const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const expenseRoutes = require('./src/routes/expense.routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use('/api/expense', expenseRoutes);
app.use(errorHandler);

module.exports = app;

const express = require('express');
const cors = require('cors');
const expenseRoutes = require('./src/routes/expense.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/expense', expenseRoutes);

module.exports = app;

const express = require('express');
const cors = require('cors');
const expenseRoutes = require('./src/routes/expense.routes');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/expense', expenseRoutes);

module.exports = app;

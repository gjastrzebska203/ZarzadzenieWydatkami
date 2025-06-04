const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const categoryRoutes = require('./src/routes/category.routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/category', categoryRoutes);
app.use(errorHandler);

module.exports = app;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const reportRoutes = require('./src/routes/report.routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/report', reportRoutes);
app.use(errorHandler);

module.exports = app;

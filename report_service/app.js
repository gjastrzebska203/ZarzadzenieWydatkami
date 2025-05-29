const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const reportRoutes = require('./src/routes/report.routes');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/report', reportRoutes);

module.exports = app;

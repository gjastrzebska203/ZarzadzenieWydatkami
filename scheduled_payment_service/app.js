const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const paymentRoutes = require('./src/routes/payment.routes');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/scheduled-payment', paymentRoutes);

module.exports = app;

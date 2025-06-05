const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const notificationsRoutes = require('./src/routes/notifications.routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/notifications', notificationsRoutes);
app.use(errorHandler);

module.exports = app;

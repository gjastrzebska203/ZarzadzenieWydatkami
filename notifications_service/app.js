const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const notificationsRoutes = require('./src/routes/notifications.routes');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/notifications', notificationsRoutes);

module.exports = app;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const userRoutes = require('./src/routes/user.routes');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/user', userRoutes);

module.exports = app;

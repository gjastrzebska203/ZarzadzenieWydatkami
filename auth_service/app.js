const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./src/routes/auth.routes');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  console.log('Auth Service działa!');
  res.send('Auth Service działa!');
});

module.exports = app;

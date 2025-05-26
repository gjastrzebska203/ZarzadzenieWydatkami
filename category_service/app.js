const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const categoryRoutes = require('./src/routes/category.routes');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/category', categoryRoutes);

app.get('/', (req, res) => {
  console.log('Category Service działa!');
  res.send('Category Service działa!');
});

module.exports = app;

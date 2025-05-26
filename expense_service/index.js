require('dotenv').config();
const app = require('./app');
const mongoose = require('./src/config/db');

const PORT = process.env.PORT || 5001;

mongoose.connection.once('open', () => {
  console.log('MongoDB połączony.');
  app.listen(PORT, () => {
    console.log(`Expense Service działa na porcie ${PORT}`);
  });
});

app.listen(PORT, () => {
  console.log(`Expense Service działa na porcie ${PORT}`);
});

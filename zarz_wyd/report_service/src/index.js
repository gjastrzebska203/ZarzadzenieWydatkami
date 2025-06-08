require('dotenv').config();
const app = require('./app');
const mongoose = require('./config/db_mongo');

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    mongoose.connection.once('open', () => {
      app.listen(PORT, () => {
        console.log(`Report Service działa na porcie ${PORT}`);
      });
    });
  } catch (err) {
    console.error('Błąd przy starcie aplikacji:', err);
    process.exit(1);
  }
};

startServer();

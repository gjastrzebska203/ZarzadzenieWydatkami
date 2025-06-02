require('dotenv').config();
const app = require('./app');
require('./src/cron/savingSuggestions');
const mongoose = require('./src/config/db_mongo');
const { sequelize, testConnection } = require('./src/config/db_psql');

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await testConnection();
    await sequelize.sync();
    mongoose.connection.once('open', () => {
      app.listen(PORT, () => {
        console.log(`Budget Service działa na porcie ${PORT}`);
      });
    });
  } catch (err) {
    console.error('Błąd przy starcie aplikacji:', err);
    process.exit(1);
  }
};

startServer();

require('dotenv').config();
const app = require('./app');
const { sequelize, testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => {
      console.log(`Serwer działa na porcie ${PORT}`);
    });
  } catch (err) {
    console.error('Błąd przy starcie aplikacji:', err);
    process.exit(1);
  }
};

startServer();

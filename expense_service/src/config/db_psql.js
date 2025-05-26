const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false,
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Połączenie z bazą danych zostało nawiązane poprawnie.');
  } catch (error) {
    console.error('Nie udało się połączyć z bazą danych:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };

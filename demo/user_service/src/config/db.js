const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false,
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Połączono z bazą danych SQL.');
  } catch (error) {
    console.log('Nie udało się połączyć z bazą danych:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };

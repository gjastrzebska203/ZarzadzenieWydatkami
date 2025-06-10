require('dotenv').config();
const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Połączono z MongoDB Atlas');
  } catch (err) {
    console.error('Błąd połączenia z MongoDB:', err.message);
    process.exit(1);
  }
};

connectMongoDB();

module.exports = mongoose;

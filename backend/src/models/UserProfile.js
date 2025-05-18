// models/userProfile.js (Mongoose)
const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: String, // odpowiada UUID z PostgreSQL
    required: true,
    index: true
  },
  bio: String,
  preferences: {
    darkMode: Boolean,
    language: { type: String, default: 'en' }
  },
  notes: [String],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'user_profiles'
});

module.exports = mongoose.model('UserProfile', userProfileSchema);

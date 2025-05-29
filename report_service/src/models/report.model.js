const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  from: {
    type: Date,
    required: true,
  },
  to: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly',
  },
  totalsByCategory: [
    {
      category: String,
      total: Number,
    },
  ],
  totalAmount: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Report', reportSchema);

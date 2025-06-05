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

reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ userId: 1, from: 1, to: 1 });

module.exports = mongoose.model('Report', reportSchema);

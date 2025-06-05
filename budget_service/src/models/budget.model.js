const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    limits: {
      type: [
        {
          category: { type: String, required: true },
          amount: { type: Number, required: true },
        },
      ],
      required: true,
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly'],
      default: 'monthly',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Budget', budgetSchema);

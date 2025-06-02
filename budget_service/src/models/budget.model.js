const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
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
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Budget', budgetSchema);

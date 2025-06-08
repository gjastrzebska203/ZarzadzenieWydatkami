const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    targetAmount: {
      type: Number,
      required: true,
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    interestRate: {
      type: Number,
      default: 0,
    },
    targetDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

investmentSchema.index({ userId: 1 });
investmentSchema.index({ userId: 1, targetDate: 1 });

module.exports = mongoose.model('Investment', investmentSchema);

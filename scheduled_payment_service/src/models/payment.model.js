const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    categoryId: {
      type: String,
      required: true,
    },
    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    dayOfMonth: {
      type: Number,
    },
    dayOfWeek: {
      type: String,
    },
    nextPaymentDate: {
      type: Date,
      required: true,
    },
    lastPaymentDate: {
      type: Date,
    },
    remindBeforeDays: {
      type: Number,
      default: 1,
    },
    autoExecute: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);

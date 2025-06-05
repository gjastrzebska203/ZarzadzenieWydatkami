const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    userId: {
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
      type: String,
      default: null,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ userId: 1 });
expenseSchema.index({ userId: 1, budgetId: 1 });
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, categoryId: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);

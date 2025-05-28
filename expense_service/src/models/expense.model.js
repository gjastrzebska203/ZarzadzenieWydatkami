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

module.exports = mongoose.model('Expense', expenseSchema);

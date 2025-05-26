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
    categoryid: {
      type: String,
      required: true,
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
    // attachment: {
    //   type: String,
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Expense', expenseSchema);

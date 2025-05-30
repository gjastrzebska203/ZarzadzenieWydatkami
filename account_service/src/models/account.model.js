const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['cash', 'card', 'bank', 'e-wallet'],
      required: true,
    },
    currency: {
      type: String,
      default: 'PLN',
    },
    balance: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model('Account', accountSchema);

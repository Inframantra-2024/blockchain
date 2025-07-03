const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
  },
  walletSecret: {
    type: String,
    required: true,
  },
  currencyType: {
    type: String,
    enum: ['USDT-TRC20', 'USDT-ERC20'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'api_failed', 'initiated'],
    default: 'pending',
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Transaction', transactionSchema);

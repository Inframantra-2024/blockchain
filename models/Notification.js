const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['DEPOSIT_SUCCESS', 'DEPOSIT_FAILED', 'WITHDRAWAL_REQUEST', 'WITHDRAWAL_APPROVED', 'WITHDRAWAL_REJECTED'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxLength: 200
  },
  message: {
    type: String,
    required: true,
    maxLength: 500
  },
  details: {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    merchantName: {
      type: String,
      required: true
    },
    merchantEmail: {
      type: String,
      required: true
    },
    transactionId: {
      type: String,
      default: null
    },
    withdrawalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Withdrawal',
      default: null
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      enum: ['USDT-TRC20', 'USDT-ERC20'],
      default: 'USDT-TRC20'
    },
    walletAddress: {
      type: String,
      default: null
    },
    feeAmount: {
      type: Number,
      default: 0
    },
    netAmount: {
      type: Number,
      default: 0
    },
    reason: {
      type: String,
      default: null
    },
    approvedBy: {
      type: String,
      default: null
    }
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  read: {
    type: Boolean,
    default: false
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ type: 1, read: 1, createdAt: -1 });
notificationSchema.index({ 'details.merchantId': 1 });
notificationSchema.index({ actionRequired: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

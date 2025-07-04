const mongoose = require('mongoose');

const merchantStatsSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  merchantName: {
    type: String,
    required: true
  },
  merchantEmail: {
    type: String,
    required: true
  },
  
  // Deposit Statistics
  deposits: {
    total: {
      count: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    successful: {
      count: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    failed: {
      count: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    pending: {
      count: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    }
  },
  
  // Withdrawal Statistics
  withdrawals: {
    total: {
      count: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    approved: {
      count: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    rejected: {
      count: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    pending: {
      count: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    }
  },
  
  // Currency breakdown
  currencies: {
    'USDT-TRC20': {
      deposits: { type: Number, default: 0 },
      withdrawals: { type: Number, default: 0 }
    },
    'USDT-ERC20': {
      deposits: { type: Number, default: 0 },
      withdrawals: { type: Number, default: 0 }
    }
  },
  
  // Current balances
  currentBalance: {
    type: Number,
    default: 0
  },
  
  // Lifetime totals
  lifetimeEarnings: {
    type: Number,
    default: 0
  },
  lifetimeWithdrawals: {
    type: Number,
    default: 0
  },
  
  // Last activity
  lastDepositAt: {
    type: Date,
    default: null
  },
  lastWithdrawalAt: {
    type: Date,
    default: null
  },
  
  // Monthly statistics (current month)
  monthlyStats: {
    month: { type: Number, default: new Date().getMonth() + 1 },
    year: { type: Number, default: new Date().getFullYear() },
    deposits: {
      count: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    withdrawals: {
      count: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
merchantStatsSchema.index({ 'monthlyStats.month': 1, 'monthlyStats.year': 1 });

// Methods to update statistics
merchantStatsSchema.methods.updateDepositStats = function(amount, currency, status) {
  // Update total deposits
  this.deposits.total.count += 1;
  this.deposits.total.amount += amount;
  
  // Update status-specific stats
  if (status === 'success') {
    this.deposits.successful.count += 1;
    this.deposits.successful.amount += amount;
    this.lifetimeEarnings += amount;
    this.lastDepositAt = new Date();
  } else if (status === 'failed') {
    this.deposits.failed.count += 1;
    this.deposits.failed.amount += amount;
  } else if (status === 'pending') {
    this.deposits.pending.count += 1;
    this.deposits.pending.amount += amount;
  }
  
  // Update currency stats
  if (currency === 'USDT-TRC20') {
    this.currencies['USDT-TRC20'].deposits += amount;
  } else if (currency === 'USDT-ERC20') {
    this.currencies['USDT-ERC20'].deposits += amount;
  }
  
  // Update monthly stats
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  if (this.monthlyStats.month !== currentMonth || this.monthlyStats.year !== currentYear) {
    // Reset monthly stats for new month
    this.monthlyStats.month = currentMonth;
    this.monthlyStats.year = currentYear;
    this.monthlyStats.deposits.count = 0;
    this.monthlyStats.deposits.amount = 0;
    this.monthlyStats.withdrawals.count = 0;
    this.monthlyStats.withdrawals.amount = 0;
  }
  
  this.monthlyStats.deposits.count += 1;
  this.monthlyStats.deposits.amount += amount;
};

merchantStatsSchema.methods.updateWithdrawalStats = function(amount, status) {
  // Update total withdrawals
  this.withdrawals.total.count += 1;
  this.withdrawals.total.amount += amount;
  
  // Update status-specific stats
  if (status === 'approved') {
    this.withdrawals.approved.count += 1;
    this.withdrawals.approved.amount += amount;
    this.lifetimeWithdrawals += amount;
    this.lastWithdrawalAt = new Date();
  } else if (status === 'rejected') {
    this.withdrawals.rejected.count += 1;
    this.withdrawals.rejected.amount += amount;
  } else if (status === 'pending') {
    this.withdrawals.pending.count += 1;
    this.withdrawals.pending.amount += amount;
  }
  
  // Update monthly stats
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  if (this.monthlyStats.month !== currentMonth || this.monthlyStats.year !== currentYear) {
    // Reset monthly stats for new month
    this.monthlyStats.month = currentMonth;
    this.monthlyStats.year = currentYear;
    this.monthlyStats.deposits.count = 0;
    this.monthlyStats.deposits.amount = 0;
    this.monthlyStats.withdrawals.count = 0;
    this.monthlyStats.withdrawals.amount = 0;
  }
  
  this.monthlyStats.withdrawals.count += 1;
  this.monthlyStats.withdrawals.amount += amount;
};

module.exports = mongoose.model('MerchantStats', merchantStatsSchema);

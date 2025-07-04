const crypto = require('crypto');
const Transaction = require('../models/depositeAmt.js');
const User = require('../models/user.js');
const logger = require('../logger/logger.js');
const blockchainService = require('../services/blockchainService.js');
const transactionMonitor = require('../services/transactionMonitor.js');
const { createWallet } = require('../util/generateWallet.js');

// 1. INITIATE TRANSACTION
exports.createTransaction = async (req, res, next) => {
  try {
    const merchant = req.merchant; // From API auth middleware
    const { amount, currencyType } = req.query; // GET request parameters

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
        error: 'Amount must be greater than 0'
      });
    }

    if (!['USDT-TRC20', 'USDT-ERC20'].includes(currencyType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid currency type',
        error: 'Currency type must be USDT-TRC20 or USDT-ERC20'
      });
    }

    // Generate unique transaction ID
    const transactionId = 'txn_' + crypto.randomBytes(16).toString('hex');

    // Generate wallet using blockchain service
    const walletData = await blockchainService.generateWallet(currencyType);

    const transaction = new Transaction({
      merchantId: merchant._id,
      transactionId,
      amount: parseFloat(amount),
      walletAddress: walletData.address,
      walletSecret: walletData.privateKey,
      currencyType,
      status: 'initiated',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
    });

    await transaction.save();

    // Start monitoring the transaction
    await transactionMonitor.startMonitoring(transaction);

    logger.info(`Transaction initiated: ${transactionId} by ${merchant.email} for ${amount} ${currencyType}`);

    res.status(200).json({
      success: true,
      message: 'Transaction initiated successfully',
      data: {
        transactionId,
        walletAddress: walletData.address,
        amount: parseFloat(amount),
        currencyType,
        expiresAt: transaction.expiresAt,
        timeRemaining: 10 * 60 * 1000, // 10 minutes in milliseconds
        network: walletData.network
      },
      error: null
    });
  } catch (err) {
    logger.error(`Transaction creation failed: ${err.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: err.message
    });
  }
};

// 2. DEPOSIT (CONFIRMATION) PROCESS
exports.depositeTransaction = async (req, res) => {
  try {
    const merchant = req.merchant; // From API auth middleware
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address required',
        error: 'Please provide the wallet address for deposit confirmation'
      });
    }

    // Validate wallet address format
    const transaction = await Transaction.findOne({
      walletAddress,
      merchantId: merchant._id,
      status: { $in: ['initiated', 'pending'] }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
        error: 'No pending transaction found for this wallet address'
      });
    }

    // Check if transaction expired
    if (blockchainService.isTransactionExpired(transaction.expiresAt)) {
      transaction.status = 'failed';
      await transaction.save();
      transactionMonitor.stopMonitoring(transaction.transactionId);

      return res.status(400).json({
        success: false,
        message: 'Transaction expired',
        error: 'This transaction has exceeded the 10-minute time limit'
      });
    }

    // Update to pending if not already
    if (transaction.status === 'initiated') {
      transaction.status = 'pending';
      await transaction.save();
    }

    // Get monitoring status
    const monitoringStatus = transactionMonitor.getMonitoringStatus(transaction.transactionId);

    logger.info(`📝 Deposit confirmation received for ${transaction.transactionId}`);

    res.status(200).json({
      success: true,
      message: 'Deposit confirmation received. Monitoring blockchain for payment...',
      data: {
        transactionId: transaction.transactionId,
        status: transaction.status,
        amount: transaction.amount,
        currencyType: transaction.currencyType,
        walletAddress: transaction.walletAddress,
        expiresAt: transaction.expiresAt,
        monitoring: monitoringStatus,
        timeRemaining: monitoringStatus ? `${monitoringStatus.remainingTime} seconds` : 'Expired'
      },
      error: null
    });

  } catch (err) {
    logger.error(`💥 Deposit confirmation failed: ${err.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to process deposit confirmation',
      error: err.message
    });
  }
};

// 3. CHECK TRANSACTION STATUS (Simple Version)
exports.checkTransactionStatus = async (req, res) => {
  try {
    const merchant = req.merchant; // From API auth middleware
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID required',
        error: 'Please provide a transaction ID'
      });
    }

    // Find the transaction
    const transaction = await Transaction.findOne({
      transactionId,
      merchantId: merchant._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
        error: 'No transaction found with this ID'
      });
    }

    // Get monitoring status if still active
    const monitoringStatus = transactionMonitor.getMonitoringStatus(transactionId);

    // Get Super Admin wallet for this currency
    const superAdminWallet = blockchainService.getSuperAdminWallet(transaction.currencyType);

    logger.info(`📊 Status check for transaction: ${transactionId}`);

    res.status(200).json({
      success: true,
      message: 'Transaction status retrieved',
      data: {
        transactionId: transaction.transactionId,
        status: transaction.status,
        amount: transaction.amount,
        currencyType: transaction.currencyType,
        walletAddress: transaction.walletAddress,
        superAdminWallet: superAdminWallet,
        createdAt: transaction.createdAt,
        expiresAt: transaction.expiresAt,
        confirmedAt: transaction.confirmedAt || null,
        failedAt: transaction.failedAt || null,
        isExpired: blockchainService.isTransactionExpired(transaction.expiresAt),
        monitoring: monitoringStatus || { isActive: false, message: 'Not being monitored' }
      },
      error: null
    });

  } catch (err) {
    logger.error(`💥 Status check failed: ${err.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to check transaction status',
      error: err.message
    });
  }
};



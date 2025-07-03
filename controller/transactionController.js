const crypto = require('crypto');
const Transaction = require('../models/depositeAmt.js');
const User = require('../models/user.js');
const logger = require('../logger/logger.js');
const { createWallet } = require('../util/generateWallet.js');
// const { simulateBlockchainConfirmation } = require('../utils/blockchainSimulator');

// 1. INITIATE TRANSACTION
exports.createTransaction = async (req, res, next) => {
  try {
    const merchant = req.user;
    const { amount, currencyType } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    if (!['USDT-TRC20', 'USDT-ERC20'].includes(currencyType)) {
      return res.status(400).json({ success: false, error: 'Invalid currency type' });
    }

    const transactionId = crypto.randomBytes(12).toString('hex');
    const walletAddress = crypto.randomBytes(16).toString('hex'); // Simulated wallet
    const walletSecret = crypto.randomBytes(32).toString('hex');

    const transaction = new Transaction({
      merchantId: merchant._id,
      transactionId,
      amount,
      walletAddress,
      walletSecret,
      currencyType,
      status: 'initiated',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
    });

    await transaction.save();
    logger.info(`Transaction initiated: ${transactionId} by ${merchant.email}`);

    res.status(201).json({
      success: true,
      message: 'Transaction initiated',
      transactionId,
      walletAddress,
    });
  } catch (err) {
    logger.error(`Transaction creation failed: ${err.message}`);
    next(err);
  }
};

// 2. DEPOSIT (CONFIRMATION) PROCESS
exports.depositeTransaction = async (req, res, next) => {
  try {
    const merchant = req.user;
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ success: false, error: 'Wallet address is required' });
    }

    const transaction = await Transaction.findOne({
      walletAddress,
      merchantId: merchant._id,
      status: 'initiated',
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found or already processed',
      });
    }

    // Update status to pending
    transaction.status = 'pending';
    await transaction.save();

    try {
      const confirmed = await simulateBlockchainConfirmation(transaction);

      if (confirmed) {
        transaction.status = 'success';
        transaction.walletSecret = 'confirmed'; // optional, for tracking
        // Update merchant balance
        await User.findByIdAndUpdate(merchant._id, {
          $inc: { totalAmt: transaction.amount },
        });
      } else {
        transaction.status = 'failed';
      }
    } catch (err) {
      transaction.status = 'api_failed';
      logger.error(`Blockchain confirmation error: ${err.message}`);
    }

    await transaction.save();

    res.status(200).json({
      success: true,
      message:
        transaction.status === 'success'
          ? 'Transaction confirmed successfully'
          : transaction.status === 'failed'
          ? 'Transaction failed confirmation'
          : 'Blockchain API failed',
      status: transaction.status,
      transactionId: transaction.transactionId,
      walletAddress: transaction.walletAddress,
    });
  } catch (err) {
    logger.error(`Deposit transaction failed: ${err.message}`);
    next(err);
  }
};



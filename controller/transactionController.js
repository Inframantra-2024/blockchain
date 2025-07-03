const User = require('../models/user.js');
const generateToken = require('../util/generateToken.js');
const {generateResetTemplate } =  require('../util/generateResetTemplate.js')
const logger = require('../logger/logger.js');
const { error } = require('winston');
const crypto = require('crypto');
const {sendEmail} = require('../util/nodeMailer.js')
const Transaction = require('../models/depositeAmt.js')

const Transaction = require('../models/transaction');
const logger = require('../logger/logger');
const { createWallet } = require('../utils/walletUtils'); // Your wallet creation util
const { simulateBlockchainConfirmation } = require('../utils/blockchainSimulator'); // Your blockchain confirmation simulator

exports.depositeTransaction = async (req, res, next) => {
  try {
    const merchant = req.user; // Set by your API key auth middleware
    const { amount, currencyType, wallet } = req.body;

    // Basic validation (you should do more in middleware)
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }
    if (!['USDT-TRC20', 'USDT-ERC20'].includes(currencyType)) {
      return res.status(400).json({ success: false, error: 'Invalid currency type' });
    }
    if (!wallet) {
      return res.status(400).json({ success: false, error: 'Wallet address is required' });
    }

    // Generate unique transactionId
    const transactionId = crypto.randomBytes(12).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // You tried to do: 
    // const walletAddress =  wait Transaction.findBy(wallet) <-- invalid code, removed.

    // Simulate third-party wallet creation (returns new address and secret)
    const { walletAddress: newWalletAddress, walletSecret } = createWallet();

    // Create new transaction (initially status 'pending')
    const transaction = new Transaction({
      merchantId: merchant._id,
      transactionId,
      amount,
      // Use wallet from request if provided, else use generated wallet address
      walletAddress: wallet || newWalletAddress,
      walletSecret,
      currencyType,
      expiresAt,
      status: 'pending',
    });

    await transaction.save();
    logger.info(`Created transaction ${transactionId} for merchant ${merchant.email}`);

    // Wrap confirmation in try-catch to handle failure
    try {
      const confirmed = await simulateBlockchainConfirmation(transaction);

      if (confirmed) {
        transaction.status = 'success';
        // TODO: Update merchant wallet balance here
      } else {
        transaction.status = 'failed';
      }
    } catch (confirmErr) {
      logger.error(`Blockchain confirmation API failed: ${confirmErr.message}`);
      transaction.status = 'api_failed';
    }

    await transaction.save();
    logger.info(`Transaction ${transaction.transactionId} status updated to ${transaction.status}`);

    res.status(201).json({
      success: true,
      message:
        transaction.status === 'success'
          ? 'Transaction confirmed successfully'
          : transaction.status === 'failed'
          ? 'Transaction failed confirmation'
          : 'Blockchain API failed',
      transactionId,
      expiresAt,
      status: transaction.status,
    });
  } catch (err) {
    logger.error(`Create transaction error: ${err.message}`);
    next(err);
  }
};


exports.createTransaction = async (req, res, next) => {
  try {
    const merchant = req.user; // Assumes merchant is authenticated and available in req.user
    const { amount, currencyType } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    if (!['USDT-TRC20', 'USDT-ERC20'].includes(currencyType)) {
      return res.status(400).json({ success: false, error: 'Invalid currency type' });
    }

    // Generate unique transaction ID
    const transactionId = crypto.randomBytes(12).toString('hex');
     const walletAddress = crypto.randomBytes(12).toString('hex');

    // Create transaction with status 'initiated'
    const transaction = new Transaction({
      merchantId: merchant._id,
      transactionId,
      amount,
      walletAddress: walletAddress,
      walletSecret: walletAddress,
      currencyType,
      status: 'initiated', // initial status
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // expiry time 10 minutes from now
    });

    await transaction.save();

    logger.info(`Transaction initiated: ${transactionId} for merchant ${merchant.email}`);

    res.status(201).json({
      success: true,
      message: 'Transaction initiated',
      transactionId,
      walletAddress: merchant.walletAddress,
    });
  } catch (err) {
    logger.error(`Transaction creation failed: ${err.message}`);
    next(err);
  }
};
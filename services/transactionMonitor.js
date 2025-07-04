const Transaction = require('../models/depositeAmt');
const User = require('../models/user');
const blockchainService = require('./blockchainService');
const adminNotification = require('./adminNotification');
const logger = require('../logger/logger');

/**
 * Simple Transaction Monitor for Beginners
 * Handles 10-minute timer and blockchain monitoring with easy-to-understand code
 */
class TransactionMonitor {
  constructor() {
    this.activeTransactions = new Map(); // Store active transactions
    this.timeoutDuration = 10 * 60 * 1000; // 10 minutes in milliseconds

    logger.info('🚀 Transaction Monitor started');
  }

  /**
   * Start monitoring a transaction (Simple Version)
   * @param {Object} transaction - Transaction object
   */
  async startMonitoring(transaction) {
    logger.info(`⏰ Starting 10-minute timer for transaction: ${transaction.transactionId}`);

    // Set 10-minute timeout
    const timeoutId = setTimeout(() => {
      this.handleTimeout(transaction.transactionId);
    }, this.timeoutDuration);

    // Store transaction info
    this.activeTransactions.set(transaction.transactionId, {
      transaction: transaction,
      timeoutId: timeoutId,
      startTime: new Date(),
      status: 'monitoring'
    });

    // Start checking blockchain after 45 seconds (blockchain confirmation time)
    setTimeout(() => {
      this.checkBlockchain(transaction);
    }, 45000); // 45 seconds

    logger.info(`✅ Monitoring started for ${transaction.transactionId} - expires at ${transaction.expiresAt}`);
  }

  /**
   * Stop monitoring a transaction (Simple Version)
   * @param {string} transactionId - Transaction ID
   */
  stopMonitoring(transactionId) {
    const monitor = this.activeTransactions.get(transactionId);
    if (monitor) {
      clearTimeout(monitor.timeoutId);
      this.activeTransactions.delete(transactionId);
      logger.info(`🛑 Stopped monitoring transaction: ${transactionId}`);
    }
  }

  /**
   * Check blockchain for transaction confirmation (Simple Version)
   * @param {Object} transaction - Transaction object
   */
  async checkBlockchain(transaction) {
    const monitor = this.activeTransactions.get(transaction.transactionId);
    if (!monitor) {
      logger.warn(`❌ Transaction ${transaction.transactionId} not found in active monitors`);
      return;
    }

    logger.info(`🔍 Checking blockchain for transaction: ${transaction.transactionId}`);

    try {
      // Use blockchain service to check transaction
      const isConfirmed = await blockchainService.monitorTransaction(transaction);

      if (isConfirmed) {
        await this.handleSuccess(transaction);
      } else {
        logger.warn(`❌ Transaction ${transaction.transactionId} not confirmed by blockchain`);
        // Transaction will timeout naturally if not confirmed
      }
    } catch (error) {
      logger.error(`💥 Error checking blockchain for ${transaction.transactionId}:`, error.message);
    }
  }

  /**
   * Handle successful transaction confirmation (Easy to Understand)
   * @param {Object} transaction - Transaction object
   */
  async handleSuccess(transaction) {
    logger.info(`🎉 GREAT NEWS! Payment confirmed: ${transaction.transactionId}`);

    try {
      // Step 1: Update transaction in database
      logger.info(`📝 Step 1: Updating transaction status to SUCCESS`);
      await Transaction.findByIdAndUpdate(transaction._id, {
        status: 'success',
        confirmedAt: new Date()
      });

      // Step 2: Add money to merchant's account
      logger.info(`💰 Step 2: Adding ${transaction.amount} ${transaction.currencyType} to merchant balance`);
      await User.findByIdAndUpdate(transaction.merchantId, {
        $inc: { totalAmt: transaction.amount }
      });

      // Step 3: Get merchant info for notification
      const merchant = await User.findById(transaction.merchantId).select('name email');

      // Step 4: Stop monitoring this transaction
      logger.info(`🛑 Step 3: Stopping monitoring for ${transaction.transactionId}`);
      this.stopMonitoring(transaction.transactionId);

      // Step 5: Notify Super Admin about successful deposit
      logger.info(`📢 Step 4: Notifying Super Admin about successful payment`);
      await adminNotification.notifyDepositSuccess(transaction, merchant);

      logger.info(`✅ ALL DONE! Transaction ${transaction.transactionId} completed successfully`);

    } catch (error) {
      logger.error(`💥 Error processing successful transaction:`, error.message);
    }
  }

  /**
   * Handle transaction timeout (Easy to Understand)
   * @param {string} transactionId - Transaction ID
   */
  async handleTimeout(transactionId) {
    logger.warn(`⏰ OH NO! Transaction timeout: ${transactionId}`);

    try {
      // Step 1: Find the transaction
      const transaction = await Transaction.findOne({ transactionId });
      if (!transaction) {
        logger.error(`❌ Could not find transaction ${transactionId}`);
        return;
      }

      // Step 2: Get merchant info
      const merchant = await User.findById(transaction.merchantId).select('name email');

      // Step 3: Update transaction status to failed
      logger.info(`📝 Step 1: Marking transaction as FAILED due to timeout`);
      await Transaction.findOneAndUpdate(
        { transactionId },
        { status: 'failed', failedAt: new Date() }
      );

      // Step 4: Remove from active monitoring
      logger.info(`🛑 Step 2: Stopping monitoring for ${transactionId}`);
      this.activeTransactions.delete(transactionId);

      // Step 5: Notify Super Admin about failed transaction
      logger.info(`📢 Step 3: Notifying Super Admin about failed payment`);
      await adminNotification.notifyDepositFailed(transaction, merchant);

      logger.info(`❌ Transaction ${transactionId} marked as FAILED - no payment received in 10 minutes`);

    } catch (error) {
      logger.error(`💥 Error handling timeout for ${transactionId}:`, error.message);
    }
  }

  /**
   * Notify Super Admin (Simple Version)
   * @param {Object} transaction - Transaction object
   * @param {string} status - Transaction status
   */
  async notifySuperAdmin(transaction, status) {
    try {
      // Get merchant details
      const merchant = await User.findById(transaction.merchantId).select('name email');

      // Simple notification log
      logger.info(`📢 SUPER ADMIN NOTIFICATION:`);
      logger.info(`   Transaction: ${transaction.transactionId}`);
      logger.info(`   Status: ${status}`);
      logger.info(`   Merchant: ${merchant.name} (${merchant.email})`);
      logger.info(`   Amount: ${transaction.amount} ${transaction.currencyType}`);
      logger.info(`   Time: ${new Date().toLocaleString()}`);

    } catch (error) {
      logger.error(`💥 Failed to notify Super Admin:`, error.message);
    }
  }

  /**
   * Get monitoring status for a transaction (Simple Version)
   * @param {string} transactionId - Transaction ID
   * @returns {Object|null} Monitoring status
   */
  getMonitoringStatus(transactionId) {
    const monitor = this.activeTransactions.get(transactionId);
    if (!monitor) {
      return null;
    }

    const elapsed = Date.now() - monitor.startTime.getTime();
    const remaining = Math.max(0, this.timeoutDuration - elapsed);

    return {
      transactionId: transactionId,
      status: monitor.status,
      startTime: monitor.startTime,
      elapsedTime: Math.floor(elapsed / 1000), // in seconds
      remainingTime: Math.floor(remaining / 1000), // in seconds
      isActive: remaining > 0
    };
  }

  /**
   * Get all active transactions (Simple Version)
   * @returns {Array} List of active transaction IDs
   */
  getActiveTransactions() {
    return Array.from(this.activeTransactions.keys());
  }

  /**
   * Get count of active transactions
   * @returns {number} Number of active transactions
   */
  getActiveCount() {
    return this.activeTransactions.size;
  }

  /**
   * Clean up expired transactions (Simple Version)
   * Runs every 2 minutes to check for expired transactions
   */
  startCleanup() {
    setInterval(async () => {
      try {
        logger.info('🧹 Checking for expired transactions...');

        const expiredTransactions = await Transaction.find({
          status: { $in: ['pending', 'initiated'] },
          expiresAt: { $lt: new Date() }
        });

        if (expiredTransactions.length > 0) {
          logger.info(`Found ${expiredTransactions.length} expired transactions`);

          for (const transaction of expiredTransactions) {
            await this.handleTimeout(transaction.transactionId);
          }
        }
      } catch (error) {
        logger.error('💥 Cleanup error:', error.message);
      }
    }, 2 * 60 * 1000); // Run every 2 minutes
  }

  /**
   * Resume monitoring for pending transactions (Simple Version)
   * Called when server restarts
   */
  async resumeMonitoring() {
    try {
      const pendingTransactions = await Transaction.find({
        status: { $in: ['pending', 'initiated'] },
        expiresAt: { $gt: new Date() }
      });

      logger.info(`🔄 Resuming monitoring for ${pendingTransactions.length} pending transactions`);

      for (const transaction of pendingTransactions) {
        const timeLeft = new Date(transaction.expiresAt) - new Date();
        if (timeLeft > 0) {
          await this.startMonitoring(transaction);
        }
      }
    } catch (error) {
      logger.error('💥 Failed to resume monitoring:', error.message);
    }
  }
}

// Create singleton instance
const transactionMonitor = new TransactionMonitor();

// Start cleanup service
transactionMonitor.startCleanup();

// Resume monitoring on startup
transactionMonitor.resumeMonitoring();

logger.info('✅ Transaction Monitor initialized and ready');

module.exports = transactionMonitor;

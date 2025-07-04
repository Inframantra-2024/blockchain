const User = require('../models/user');
const Notification = require('../models/Notification');
const MerchantStats = require('../models/MerchantStats');
const emailService = require('./emailService');
const logger = require('../logger/logger');

/**
 * Enhanced Admin Notification Service
 * Stores notifications in database and sends emails
 */
class AdminNotificationService {
  constructor() {
    logger.info('📢 Enhanced Admin Notification Service started');
    logger.info('💾 Notifications will be stored in database');
    logger.info('📧 Email notifications will be sent to admin');
  }

  /**
   * Notify admin about successful deposit (Enhanced with Database & Email)
   * @param {Object} transaction - Transaction object
   * @param {Object} merchant - Merchant object
   */
  async notifyDepositSuccess(transaction, merchant) {
    try {
      logger.info(`📢 STEP 1: Creating deposit success notification in database`);

      // Create notification in database
      const notification = new Notification({
        type: 'DEPOSIT_SUCCESS',
        title: '💰 New Payment Received!',
        message: `${merchant.name} received ${transaction.amount} ${transaction.currencyType}`,
        details: {
          merchantId: merchant._id,
          merchantName: merchant.name,
          merchantEmail: merchant.email,
          transactionId: transaction.transactionId,
          amount: transaction.amount,
          currency: transaction.currencyType,
          walletAddress: transaction.walletAddress
        },
        priority: 'normal',
        read: false,
        actionRequired: false
      });

      await notification.save();
      logger.info(`✅ STEP 2: Notification saved to database with ID: ${notification._id}`);

      // Update merchant statistics
      logger.info(`📊 STEP 3: Updating merchant statistics`);
      await this.updateMerchantStats(merchant._id, merchant, 'deposit', transaction.amount, transaction.currencyType, 'success');

      // Send email notification
      logger.info(`📧 STEP 4: Sending email notification to admin`);
      const emailSent = await emailService.sendDepositSuccessEmail(notification);

      if (emailSent) {
        notification.emailSent = true;
        notification.emailSentAt = new Date();
        await notification.save();
        logger.info(`✅ Email notification sent successfully`);
      }

      // Log for console monitoring
      logger.info(`📢 ADMIN NOTIFICATION - DEPOSIT SUCCESS:`);
      logger.info(`   🏪 Merchant: ${merchant.name} (${merchant.email})`);
      logger.info(`   💰 Amount: ${transaction.amount} ${transaction.currencyType}`);
      logger.info(`   🆔 Transaction: ${transaction.transactionId}`);
      logger.info(`   📍 Wallet: ${transaction.walletAddress}`);
      logger.info(`   💾 Database: Saved`);
      logger.info(`   📧 Email: ${emailSent ? 'Sent' : 'Failed'}`);
      logger.info(`   ⏰ Time: ${new Date().toLocaleString()}`);

    } catch (error) {
      logger.error(`💥 Failed to notify admin about deposit: ${error.message}`);
    }
  }

  /**
   * Notify admin about failed deposit (Enhanced with Database & Email)
   * @param {Object} transaction - Transaction object
   * @param {Object} merchant - Merchant object
   */
  async notifyDepositFailed(transaction, merchant) {
    try {
      logger.info(`📢 STEP 1: Creating deposit failed notification in database`);

      // Create notification in database
      const notification = new Notification({
        type: 'DEPOSIT_FAILED',
        title: '❌ Payment Failed',
        message: `${merchant.name}'s transaction failed - no payment received`,
        details: {
          merchantId: merchant._id,
          merchantName: merchant.name,
          merchantEmail: merchant.email,
          transactionId: transaction.transactionId,
          amount: transaction.amount,
          currency: transaction.currencyType,
          walletAddress: transaction.walletAddress,
          reason: 'No payment received within 10 minutes'
        },
        priority: 'low',
        read: false,
        actionRequired: false
      });

      await notification.save();
      logger.info(`✅ STEP 2: Notification saved to database with ID: ${notification._id}`);

      // Update merchant statistics
      logger.info(`📊 STEP 3: Updating merchant statistics`);
      await this.updateMerchantStats(merchant._id, merchant, 'deposit', transaction.amount, transaction.currencyType, 'failed');

      // Send email notification
      logger.info(`📧 STEP 4: Sending email notification to admin`);
      const emailSent = await emailService.sendDepositFailedEmail(notification);

      if (emailSent) {
        notification.emailSent = true;
        notification.emailSentAt = new Date();
        await notification.save();
        logger.info(`✅ Email notification sent successfully`);
      }

      // Log for console monitoring
      logger.info(`📢 ADMIN NOTIFICATION - DEPOSIT FAILED:`);
      logger.info(`   🏪 Merchant: ${merchant.name} (${merchant.email})`);
      logger.info(`   💰 Expected: ${transaction.amount} ${transaction.currencyType}`);
      logger.info(`   🆔 Transaction: ${transaction.transactionId}`);
      logger.info(`   ❌ Reason: No payment received within 10 minutes`);
      logger.info(`   💾 Database: Saved`);
      logger.info(`   📧 Email: ${emailSent ? 'Sent' : 'Failed'}`);
      logger.info(`   ⏰ Time: ${new Date().toLocaleString()}`);

    } catch (error) {
      logger.error(`💥 Failed to notify admin about failed deposit: ${error.message}`);
    }
  }

  /**
   * Notify admin about withdrawal request (Enhanced with Database & Email)
   * @param {Object} withdrawal - Withdrawal object
   * @param {Object} merchant - Merchant object
   */
  async notifyWithdrawalRequest(withdrawal, merchant) {
    try {
      logger.info(`📢 STEP 1: Creating withdrawal request notification in database`);

      // Create notification in database
      const notification = new Notification({
        type: 'WITHDRAWAL_REQUEST',
        title: '🏦 New Withdrawal Request',
        message: `${merchant.name} wants to withdraw ${withdrawal.netAmount} USDT`,
        details: {
          merchantId: merchant._id,
          merchantName: merchant.name,
          merchantEmail: merchant.email,
          withdrawalId: withdrawal._id,
          amount: withdrawal.amount,
          feeAmount: withdrawal.feeAmount,
          netAmount: withdrawal.netAmount
        },
        priority: 'high',
        read: false,
        actionRequired: true
      });

      await notification.save();
      logger.info(`✅ STEP 2: Notification saved to database with ID: ${notification._id}`);

      // Update merchant statistics
      logger.info(`📊 STEP 3: Updating merchant statistics`);
      await this.updateMerchantStats(merchant._id, merchant, 'withdrawal', withdrawal.amount, 'USDT', 'pending');

      // Send email notification
      logger.info(`📧 STEP 4: Sending email notification to admin`);
      const emailSent = await emailService.sendWithdrawalRequestEmail(notification);

      if (emailSent) {
        notification.emailSent = true;
        notification.emailSentAt = new Date();
        await notification.save();
        logger.info(`✅ Email notification sent successfully`);
      }

      // Log for console monitoring
      logger.info(`📢 ADMIN NOTIFICATION - WITHDRAWAL REQUEST:`);
      logger.info(`   🏪 Merchant: ${merchant.name} (${merchant.email})`);
      logger.info(`   💰 Requested: ${withdrawal.amount} USDT`);
      logger.info(`   💸 Fee: ${withdrawal.feeAmount} USDT`);
      logger.info(`   💵 Net Amount: ${withdrawal.netAmount} USDT`);
      logger.info(`   📍 To Wallet: ${merchant.walletAddress}`);
      logger.info(`   🚨 ACTION REQUIRED: Please approve or reject this withdrawal`);
      logger.info(`   💾 Database: Saved`);
      logger.info(`   📧 Email: ${emailSent ? 'Sent' : 'Failed'}`);
      logger.info(`   ⏰ Time: ${new Date().toLocaleString()}`);

    } catch (error) {
      logger.error(`💥 Failed to notify admin about withdrawal: ${error.message}`);
    }
  }

  /**
   * Notify admin about withdrawal approval (Enhanced with Database & Email)
   * @param {Object} withdrawal - Withdrawal object
   * @param {Object} merchant - Merchant object
   * @param {string} approvedBy - Who approved the withdrawal
   */
  async notifyWithdrawalApproved(withdrawal, merchant, approvedBy = 'Super Admin') {
    try {
      logger.info(`📢 STEP 1: Creating withdrawal approved notification in database`);

      // Create notification in database
      const notification = new Notification({
        type: 'WITHDRAWAL_APPROVED',
        title: '✅ Withdrawal Approved',
        message: `Withdrawal of ${withdrawal.netAmount} USDT approved for ${merchant.name}`,
        details: {
          merchantId: merchant._id,
          merchantName: merchant.name,
          merchantEmail: merchant.email,
          withdrawalId: withdrawal._id,
          amount: withdrawal.amount,
          netAmount: withdrawal.netAmount,
          approvedBy: approvedBy
        },
        priority: 'normal',
        read: false,
        actionRequired: false
      });

      await notification.save();
      logger.info(`✅ STEP 2: Notification saved to database with ID: ${notification._id}`);

      // Update merchant statistics
      logger.info(`📊 STEP 3: Updating merchant statistics`);
      await this.updateMerchantStats(merchant._id, merchant, 'withdrawal', withdrawal.amount, 'USDT', 'approved');

      // Send email notification
      logger.info(`📧 STEP 4: Sending email notification to admin`);
      const emailSent = await emailService.sendWithdrawalApprovedEmail(notification);

      if (emailSent) {
        notification.emailSent = true;
        notification.emailSentAt = new Date();
        await notification.save();
        logger.info(`✅ Email notification sent successfully`);
      }

      // Log for console monitoring
      logger.info(`📢 ADMIN NOTIFICATION - WITHDRAWAL APPROVED:`);
      logger.info(`   🏪 Merchant: ${merchant.name} (${merchant.email})`);
      logger.info(`   💰 Amount: ${withdrawal.netAmount} USDT`);
      logger.info(`   📍 To Wallet: ${merchant.walletAddress}`);
      logger.info(`   ✅ Status: Approved and processed by ${approvedBy}`);
      logger.info(`   💾 Database: Saved`);
      logger.info(`   📧 Email: ${emailSent ? 'Sent' : 'Failed'}`);
      logger.info(`   ⏰ Time: ${new Date().toLocaleString()}`);

    } catch (error) {
      logger.error(`💥 Failed to notify admin about withdrawal approval: ${error.message}`);
    }
  }

  /**
   * Get all notifications for admin dashboard
   * @returns {Array} List of notifications
   */
  getAllNotifications() {
    return this.notifications.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get unread notifications count
   * @returns {number} Number of unread notifications
   */
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Mark notification as read
   * @param {number} index - Notification index
   */
  markAsRead(index) {
    if (this.notifications[index]) {
      this.notifications[index].read = true;
      logger.info(`📖 Notification marked as read`);
    }
  }

  /**
   * Get summary for admin dashboard
   * @returns {Object} Notification summary
   */
  getSummary() {
    const total = this.notifications.length;
    const unread = this.getUnreadCount();
    const deposits = this.notifications.filter(n => n.type.includes('DEPOSIT')).length;
    const withdrawals = this.notifications.filter(n => n.type.includes('WITHDRAWAL')).length;
    const actionRequired = this.notifications.filter(n => n.actionRequired && !n.read).length;

    return {
      total,
      unread,
      deposits,
      withdrawals,
      actionRequired,
      lastNotification: this.notifications[0]?.createdAt || null
    };
  }

  /**
   * Update merchant statistics (Enhanced)
   * @param {string} merchantId - Merchant ID
   * @param {Object} merchant - Merchant object
   * @param {string} type - 'deposit' or 'withdrawal'
   * @param {number} amount - Transaction amount
   * @param {string} currency - Currency type
   * @param {string} status - Transaction status
   */
  async updateMerchantStats(merchantId, merchant, type, amount, currency, status) {
    try {
      // Find or create merchant stats
      let stats = await MerchantStats.findOne({ merchantId });

      if (!stats) {
        logger.info(`📊 Creating new stats record for merchant: ${merchant.name}`);
        stats = new MerchantStats({
          merchantId: merchantId,
          merchantName: merchant.name,
          merchantEmail: merchant.email
        });
      }

      // Update current balance from user model
      const currentUser = await User.findById(merchantId).select('totalAmt');
      if (currentUser) {
        stats.currentBalance = currentUser.totalAmt || 0;
      }

      // Update statistics based on type
      if (type === 'deposit') {
        stats.updateDepositStats(amount, currency, status);
        logger.info(`📊 Updated deposit stats: ${amount} ${currency} - ${status}`);
      } else if (type === 'withdrawal') {
        stats.updateWithdrawalStats(amount, status);
        logger.info(`📊 Updated withdrawal stats: ${amount} USDT - ${status}`);
      }

      await stats.save();
      logger.info(`✅ Merchant statistics updated successfully`);

    } catch (error) {
      logger.error(`💥 Failed to update merchant statistics: ${error.message}`);
    }
  }

  /**
   * Get all notifications from database
   * @param {number} limit - Number of notifications to retrieve
   * @param {number} skip - Number of notifications to skip
   * @returns {Array} List of notifications
   */
  async getAllNotifications(limit = 50, skip = 0) {
    try {
      const notifications = await Notification.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('details.merchantId', 'name email');

      return notifications;
    } catch (error) {
      logger.error(`💥 Failed to get notifications: ${error.message}`);
      return [];
    }
  }

  /**
   * Get unread notifications count
   * @returns {number} Number of unread notifications
   */
  async getUnreadCount() {
    try {
      return await Notification.countDocuments({ read: false });
    } catch (error) {
      logger.error(`💥 Failed to get unread count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   */
  async markAsRead(notificationId) {
    try {
      await Notification.findByIdAndUpdate(notificationId, { read: true });
      logger.info(`📖 Notification ${notificationId} marked as read`);
    } catch (error) {
      logger.error(`💥 Failed to mark notification as read: ${error.message}`);
    }
  }

  /**
   * Get merchant statistics
   * @param {string} merchantId - Merchant ID
   * @returns {Object} Merchant statistics
   */
  async getMerchantStats(merchantId) {
    try {
      return await MerchantStats.findOne({ merchantId });
    } catch (error) {
      logger.error(`💥 Failed to get merchant stats: ${error.message}`);
      return null;
    }
  }

  /**
   * Get summary for admin dashboard
   * @returns {Object} Notification summary
   */
  async getSummary() {
    try {
      const total = await Notification.countDocuments();
      const unread = await Notification.countDocuments({ read: false });
      const deposits = await Notification.countDocuments({ type: { $in: ['DEPOSIT_SUCCESS', 'DEPOSIT_FAILED'] } });
      const withdrawals = await Notification.countDocuments({ type: { $in: ['WITHDRAWAL_REQUEST', 'WITHDRAWAL_APPROVED', 'WITHDRAWAL_REJECTED'] } });
      const actionRequired = await Notification.countDocuments({ actionRequired: true, read: false });

      const lastNotification = await Notification.findOne().sort({ createdAt: -1 });

      return {
        total,
        unread,
        deposits,
        withdrawals,
        actionRequired,
        lastNotification: lastNotification?.createdAt || null
      };
    } catch (error) {
      logger.error(`💥 Failed to get summary: ${error.message}`);
      return { total: 0, unread: 0, deposits: 0, withdrawals: 0, actionRequired: 0, lastNotification: null };
    }
  }

  /**
   * Clean up old notifications (keep last 1000)
   */
  async cleanup() {
    try {
      const totalCount = await Notification.countDocuments();
      if (totalCount > 1000) {
        const oldNotifications = await Notification.find()
          .sort({ createdAt: 1 })
          .limit(totalCount - 1000);

        const idsToDelete = oldNotifications.map(n => n._id);
        await Notification.deleteMany({ _id: { $in: idsToDelete } });

        logger.info(`🧹 Cleaned up ${idsToDelete.length} old notifications, keeping last 1000`);
      }
    } catch (error) {
      logger.error(`💥 Failed to cleanup notifications: ${error.message}`);
    }
  }
}

// Create singleton instance
const adminNotificationService = new AdminNotificationService();

// Cleanup every hour
setInterval(() => {
  adminNotificationService.cleanup();
}, 60 * 60 * 1000);

module.exports = adminNotificationService;

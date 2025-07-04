const adminNotification = require('../services/adminNotification');
const logger = require('../logger/logger');

/**
 * Get all notifications for admin dashboard
 */
exports.getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, read } = req.query;
    const skip = (page - 1) * limit;

    logger.info(`📋 Admin requesting notifications - Page: ${page}, Limit: ${limit}`);

    // Get notifications from database
    const notifications = await adminNotification.getAllNotifications(parseInt(limit), skip);
    
    // Get summary statistics
    const summary = await adminNotification.getSummary();

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications: notifications,
        summary: summary,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
          total: summary.total
        }
      },
      error: null
    });

  } catch (error) {
    logger.error(`💥 Failed to get notifications: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: error.message
    });
  }
};

/**
 * Get notification summary for dashboard
 */
exports.getNotificationSummary = async (req, res) => {
  try {
    logger.info(`📊 Admin requesting notification summary`);

    const summary = await adminNotification.getSummary();
    const unreadCount = await adminNotification.getUnreadCount();

    res.status(200).json({
      success: true,
      message: 'Notification summary retrieved successfully',
      data: {
        ...summary,
        unreadCount: unreadCount
      },
      error: null
    });

  } catch (error) {
    logger.error(`💥 Failed to get notification summary: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notification summary',
      error: error.message
    });
  }
};

/**
 * Mark notification as read
 */
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    logger.info(`📖 Marking notification as read: ${notificationId}`);

    await adminNotification.markAsRead(notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      error: null
    });

  } catch (error) {
    logger.error(`💥 Failed to mark notification as read: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

/**
 * Get merchant statistics
 */
exports.getMerchantStats = async (req, res) => {
  try {
    const { merchantId } = req.params;

    logger.info(`📊 Getting statistics for merchant: ${merchantId}`);

    const stats = await adminNotification.getMerchantStats(merchantId);

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'Merchant statistics not found',
        error: 'No statistics available for this merchant'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Merchant statistics retrieved successfully',
      data: stats,
      error: null
    });

  } catch (error) {
    logger.error(`💥 Failed to get merchant statistics: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve merchant statistics',
      error: error.message
    });
  }
};

/**
 * Get all merchants statistics (for admin overview)
 */
exports.getAllMerchantsStats = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    logger.info(`📊 Admin requesting all merchants statistics`);

    const MerchantStats = require('../models/MerchantStats');
    
    const stats = await MerchantStats.find()
      .sort({ 'lifetimeEarnings': -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalMerchants = await MerchantStats.countDocuments();

    // Calculate platform totals
    const platformTotals = await MerchantStats.aggregate([
      {
        $group: {
          _id: null,
          totalDeposits: { $sum: '$deposits.successful.amount' },
          totalWithdrawals: { $sum: '$withdrawals.approved.amount' },
          totalEarnings: { $sum: '$lifetimeEarnings' },
          totalCurrentBalance: { $sum: '$currentBalance' },
          totalMerchants: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'All merchants statistics retrieved successfully',
      data: {
        merchants: stats,
        platformTotals: platformTotals[0] || {
          totalDeposits: 0,
          totalWithdrawals: 0,
          totalEarnings: 0,
          totalCurrentBalance: 0,
          totalMerchants: 0
        },
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
          total: totalMerchants,
          totalPages: Math.ceil(totalMerchants / limit)
        }
      },
      error: null
    });

  } catch (error) {
    logger.error(`💥 Failed to get all merchants statistics: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve merchants statistics',
      error: error.message
    });
  }
};

/**
 * Get platform overview statistics
 */
exports.getPlatformOverview = async (req, res) => {
  try {
    logger.info(`📊 Admin requesting platform overview`);

    const Notification = require('../models/Notification');
    const MerchantStats = require('../models/MerchantStats');
    const User = require('../models/user');
    const Transaction = require('../models/depositeAmt');

    // Get various statistics
    const [
      totalMerchants,
      totalNotifications,
      unreadNotifications,
      recentTransactions,
      platformStats
    ] = await Promise.all([
      User.countDocuments({ role: 'merchant' }),
      Notification.countDocuments(),
      Notification.countDocuments({ read: false }),
      Transaction.find().sort({ createdAt: -1 }).limit(5).populate('merchantId', 'name email'),
      MerchantStats.aggregate([
        {
          $group: {
            _id: null,
            totalDeposits: { $sum: '$deposits.successful.amount' },
            totalWithdrawals: { $sum: '$withdrawals.approved.amount' },
            totalFailedDeposits: { $sum: '$deposits.failed.amount' },
            totalPendingWithdrawals: { $sum: '$withdrawals.pending.amount' },
            totalCurrentBalance: { $sum: '$currentBalance' }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      message: 'Platform overview retrieved successfully',
      data: {
        merchants: {
          total: totalMerchants
        },
        notifications: {
          total: totalNotifications,
          unread: unreadNotifications
        },
        transactions: {
          recent: recentTransactions
        },
        platform: platformStats[0] || {
          totalDeposits: 0,
          totalWithdrawals: 0,
          totalFailedDeposits: 0,
          totalPendingWithdrawals: 0,
          totalCurrentBalance: 0
        }
      },
      error: null
    });

  } catch (error) {
    logger.error(`💥 Failed to get platform overview: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve platform overview',
      error: error.message
    });
  }
};

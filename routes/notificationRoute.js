const express = require('express');
const router = express.Router();
const {
  getAllNotifications,
  getNotificationSummary,
  markNotificationAsRead,
  getMerchantStats,
  getAllMerchantsStats,
  getPlatformOverview
} = require('../controller/notificationController');
const { protect, authorizeRoles } = require('../middleware/routeProtector');
const { validateRequest } = require('../middleware/validateIncomingRequest');

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Notification unique identifier
 *         type:
 *           type: string
 *           enum: [DEPOSIT_SUCCESS, DEPOSIT_FAILED, WITHDRAWAL_REQUEST, WITHDRAWAL_APPROVED, WITHDRAWAL_REJECTED]
 *           description: Type of notification
 *         title:
 *           type: string
 *           description: Notification title
 *         message:
 *           type: string
 *           description: Notification message
 *         details:
 *           type: object
 *           description: Detailed information about the notification
 *         priority:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *           description: Notification priority
 *         read:
 *           type: boolean
 *           description: Whether notification has been read
 *         actionRequired:
 *           type: boolean
 *           description: Whether action is required from admin
 *         emailSent:
 *           type: boolean
 *           description: Whether email notification was sent
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     MerchantStats:
 *       type: object
 *       properties:
 *         merchantId:
 *           type: string
 *           description: Merchant ID
 *         merchantName:
 *           type: string
 *           description: Merchant name
 *         merchantEmail:
 *           type: string
 *           description: Merchant email
 *         deposits:
 *           type: object
 *           description: Deposit statistics
 *         withdrawals:
 *           type: object
 *           description: Withdrawal statistics
 *         currentBalance:
 *           type: number
 *           description: Current balance
 *         lifetimeEarnings:
 *           type: number
 *           description: Total lifetime earnings
 */

// All routes require admin or superadmin access
router.use(protect, authorizeRoles('admin', 'superadmin'));

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications
 *     description: Admin/SuperAdmin can view all notifications with pagination
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [DEPOSIT_SUCCESS, DEPOSIT_FAILED, WITHDRAWAL_REQUEST, WITHDRAWAL_APPROVED]
 *         description: Filter by notification type
 *       - in: query
 *         name: read
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 */
router.get('/', getAllNotifications);

/**
 * @swagger
 * /notifications/summary:
 *   get:
 *     summary: Get notification summary
 *     description: Get summary statistics for admin dashboard
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Notification summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 total: 150
 *                 unread: 12
 *                 deposits: 100
 *                 withdrawals: 50
 *                 actionRequired: 5
 *       401:
 *         description: Unauthorized - Admin access required
 */
router.get('/summary', getNotificationSummary);

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *         example: "60d5ecb74b24a1234567890a"
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized - Admin access required
 */
router.patch('/:notificationId/read', markNotificationAsRead);

/**
 * @swagger
 * /notifications/stats/merchant/{merchantId}:
 *   get:
 *     summary: Get merchant statistics
 *     description: Get detailed statistics for a specific merchant
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant ID
 *         example: "60d5ecb74b24a1234567890a"
 *     responses:
 *       200:
 *         description: Merchant statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Merchant statistics not found
 *       401:
 *         description: Unauthorized - Admin access required
 */
router.get('/stats/merchant/:merchantId', getMerchantStats);

/**
 * @swagger
 * /notifications/stats/merchants:
 *   get:
 *     summary: Get all merchants statistics
 *     description: Get statistics overview for all merchants
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: All merchants statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 */
router.get('/stats/merchants', getAllMerchantsStats);

/**
 * @swagger
 * /notifications/stats/platform:
 *   get:
 *     summary: Get platform overview
 *     description: Get comprehensive platform statistics and overview
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Platform overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 merchants:
 *                   total: 25
 *                 notifications:
 *                   total: 150
 *                   unread: 12
 *                 platform:
 *                   totalDeposits: 50000
 *                   totalWithdrawals: 30000
 *                   totalCurrentBalance: 20000
 *       401:
 *         description: Unauthorized - Admin access required
 */
router.get('/stats/platform', getPlatformOverview);

module.exports = router;

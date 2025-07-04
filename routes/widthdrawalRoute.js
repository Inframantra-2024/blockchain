const express = require('express');
const router = express.Router();

const {
  withdrawalRequestValidation,
  withdrawalActionValidation
} = require('../validations/withdrawaValidator');

const {
  getAllWithdrawals,
  getMerchantWithdrawals,
  initiateWithdrawal,
  handleWithdrawalStatus
} = require('../controller/widthdrawalController');

const { validatePagination } = require('../validations/paginationAndFilter');
const { validateRequest } = require('../middleware/validateIncomingRequest');
const { protect, authorizeRoles } = require('../middleware/routeProtector');

/**
 * @swagger
 * components:
 *   schemas:
 *     Withdrawal:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Withdrawal unique identifier
 *         merchantId:
 *           type: string
 *           description: Reference to merchant user
 *         amount:
 *           type: number
 *           description: Withdrawal amount requested
 *         feeAmount:
 *           type: number
 *           description: Fee amount deducted
 *         netAmount:
 *           type: number
 *           description: Net amount after fee deduction
 *         feeId:
 *           type: string
 *           description: Reference to fee setting used
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
 *           description: Withdrawal status
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     WithdrawalRequest:
 *       type: object
 *       required:
 *         - amount
 *         - feeId
 *       properties:
 *         amount:
 *           type: number
 *           minimum: 0.01
 *           example: 1000
 *           description: Amount to withdraw
 *         feeId:
 *           type: string
 *           example: "60d5ecb74b24a1234567890a"
 *           description: Fee setting ID to apply
 *
 *     WithdrawalListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Withdrawal'
 *         pagination:
 *           type: object
 *           properties:
 *             totalRecords:
 *               type: number
 *             totalPages:
 *               type: number
 *             currentPage:
 *               type: number
 *             limit:
 *               type: number
 *         error:
 *           type: string
 *           nullable: true
 */

/**
 * @swagger
 * /withdrawal:
 *   post:
 *     summary: Initiate withdrawal request
 *     description: Merchant can request withdrawal of available funds
 *     tags: [Withdrawals]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WithdrawalRequest'
 *     responses:
 *       201:
 *         description: Withdrawal request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Withdrawal request submitted successfully"
 *               data:
 *                 withdrawal:
 *                   _id: "60d5ecb74b24a1234567890a"
 *                   amount: 1000
 *                   feeAmount: 50
 *                   netAmount: 950
 *                   status: "pending"
 *               error: null
 *       400:
 *         description: Insufficient balance or validation error
 *       401:
 *         description: Unauthorized - Merchant access required
 *       404:
 *         description: Fee setting not found
 */
router.post(
  '/',
  protect,
  authorizeRoles('merchant'),
  withdrawalRequestValidation,
  validateRequest,
  initiateWithdrawal
);

/**
 * @swagger
 * /withdrawal/{withdrawalId}:
 *   patch:
 *     summary: Approve or reject withdrawal
 *     description: Admin/SuperAdmin can approve or reject withdrawal requests
 *     tags: [Withdrawals]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: withdrawalId
 *         required: true
 *         schema:
 *           type: string
 *         description: Withdrawal ID
 *         example: "60d5ecb74b24a1234567890a"
 *       - in: query
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [approve, reject]
 *         description: Action to perform
 *         example: "approve"
 *     responses:
 *       200:
 *         description: Withdrawal status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Withdrawal approved successfully"
 *               error: null
 *       400:
 *         description: Invalid action or withdrawal already processed
 *       401:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: Withdrawal not found
 */
router.patch(
  '/:withdrawalId',
  protect,
  authorizeRoles('admin', 'superadmin'),
  withdrawalActionValidation,
  validateRequest,
  handleWithdrawalStatus
);

/**
 * @swagger
 * /withdrawal:
 *   get:
 *     summary: Get all withdrawals
 *     description: Admin/SuperAdmin can view all withdrawal requests with pagination
 *     tags: [Withdrawals]
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
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of withdrawals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WithdrawalListResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  '/',
  protect,
  authorizeRoles('admin', 'superadmin'),
  validatePagination,
  validateRequest,
  getAllWithdrawals
);

/**
 * @swagger
 * /withdrawal/merchant/{merchantId}:
 *   get:
 *     summary: Get merchant withdrawals
 *     description: Admin/SuperAdmin can view specific merchant's withdrawal requests
 *     tags: [Withdrawals]
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
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Merchant withdrawals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WithdrawalListResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: Merchant not found
 */
router.get(
  '/merchant/:merchantId',
  protect,
  authorizeRoles('admin', 'superadmin'),
  validatePagination,
  validateRequest,
  getMerchantWithdrawals
);

module.exports = router;

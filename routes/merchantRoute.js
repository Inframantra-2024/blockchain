
const express = require('express');
const router = express.Router()
const { getAllMerchants, getMerchantById, getMerchantTransactions } = require('../controller/merchantController.js');
const { validatePagination } = require('../validations/paginationAndFilter.js');
const { validateRequest } = require('../middleware/validateIncomingRequest.js');
const {IdValidator} = require('../validations/merchantVlidator.js')
const { protect, authorizeRoles } = require('../middleware/routeProtector.js');

/**
 * @swagger
 * components:
 *   schemas:
 *     MerchantListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
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
 *
 *     TransactionListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Transaction'
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
 * /merchant:
 *   get:
 *     summary: Get all merchants
 *     description: Admin/SuperAdmin can view all merchants with pagination
 *     tags: [Merchant Management]
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
 *         description: Merchants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MerchantListResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 */
router.get('/', protect, authorizeRoles('admin', 'superadmin'), validatePagination, validateRequest, getAllMerchants);

/**
 * @swagger
 * /merchant/{merchantId}:
 *   get:
 *     summary: Get merchant by ID
 *     description: Get specific merchant details. Admin/SuperAdmin can view any merchant, merchants can view their own details
 *     tags: [Merchant Management]
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
 *         description: Merchant details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 _id: "60d5ecb74b24a1234567890a"
 *                 name: "John Doe"
 *                 email: "john@example.com"
 *                 role: "merchant"
 *                 approved: "approved"
 *                 totalAmt: 5000
 *                 apiKey: "mk_live_1234567890abcdef"
 *               error: null
 *       404:
 *         description: Merchant not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only access own data
 */
router.get('/:merchantId', protect, authorizeRoles('admin', 'superadmin','merchant'),IdValidator,validateRequest, getMerchantById);

/**
 * @swagger
 * /merchant/{merchantId}/transactions:
 *   get:
 *     summary: Get merchant transactions
 *     description: Get all transactions for a specific merchant with pagination
 *     tags: [Merchant Management]
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
 *         description: Merchant transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionListResponse'
 *       404:
 *         description: Merchant not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only access own data
 */
router.get('/:merchantId/transactions', protect, authorizeRoles('admin', 'superadmin','merchant'), validatePagination,validateRequest, getMerchantTransactions);

module.exports = router;
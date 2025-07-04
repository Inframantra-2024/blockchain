const express = require('express');
const router = express.Router();
const { createTransaction, depositeTransaction, checkTransactionStatus} = require('../controller/transactionController');
const {initiateTransactionValidator, validateDepositeTransaction} = require('../validations/transactionValidator')
const { apiAuth } = require('../middleware/VerifyMerchant');
const { validateRequest } = require('../middleware/validateIncomingRequest');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Transaction unique identifier
 *         merchantId:
 *           type: string
 *           description: Reference to merchant user
 *         transactionId:
 *           type: string
 *           description: Unique transaction identifier
 *         amount:
 *           type: number
 *           description: Transaction amount
 *         walletAddress:
 *           type: string
 *           description: Destination wallet address
 *         walletSecret:
 *           type: string
 *           description: Wallet private key/secret
 *         currencyType:
 *           type: string
 *           enum: [USDT-TRC20, USDT-ERC20]
 *           description: Cryptocurrency type
 *         status:
 *           type: string
 *           enum: [pending, success, failed, api_failed, initiated]
 *           description: Transaction status
 *         expiresAt:
 *           type: Date
 *           description: Transaction expiration time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateTransactionRequest:
 *       type: object
 *       required:
 *         - amount
 *         - currencyType
 *       properties:
 *         amount:
 *           type: number
 *           minimum: 0.01
 *           example: 500
 *           description: Amount to deposit
 *         currencyType:
 *           type: string
 *           enum: [USDT-TRC20, USDT-ERC20]
 *           example: "USDT-TRC20"
 *           description: Type of cryptocurrency
 *
 *     DepositTransactionRequest:
 *       type: object
 *       required:
 *         - walletAddress
 *       properties:
 *         walletAddress:
 *           type: string
 *           example: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"
 *           description: Wallet address for deposit confirmation
 *
 *     TransactionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             transaction:
 *               $ref: '#/components/schemas/Transaction'
 *             walletAddress:
 *               type: string
 *             expiresAt:
 *               type: string
 *               format: date-time
 *         error:
 *           type: string
 *           nullable: true
 */

/**
 * @swagger
 * /transaction/{apiKey}/create:
 *   get:
 *     summary: Create a new transaction
 *     description: Initiate a new cryptocurrency deposit transaction for a merchant
 *     tags: [Transactions]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: apiKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant API key
 *         example: "mk_test_1234567890abcdef"
 *       - in: query
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *           minimum: 0.01
 *         description: Amount to deposit
 *         example: 500
 *       - in: query
 *         name: currencyType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [USDT-TRC20, USDT-ERC20]
 *         description: Type of cryptocurrency
 *         example: "USDT-TRC20"
 *     responses:
 *       200:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *             example:
 *               success: true
 *               message: "Transaction initiated successfully"
 *               data:
 *                 transaction:
 *                   _id: "60d5ecb74b24a1234567890a"
 *                   transactionId: "txn_1234567890"
 *                   amount: 500
 *                   currencyType: "USDT-TRC20"
 *                   status: "initiated"
 *                   expiresAt: "2024-01-01T10:10:00.000Z"
 *                 walletAddress: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"
 *               error: null
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid API credentials
 *       500:
 *         description: Internal server error
 */
router.get('/:apiKey/create',apiAuth ,initiateTransactionValidator,validateRequest ,createTransaction);

/**
 * @swagger
 * /transaction/{apiKey}/deposite:
 *   post:
 *     summary: Confirm deposit transaction
 *     description: Confirm a deposit transaction by providing wallet address
 *     tags: [Transactions]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: apiKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant API key
 *         example: "mk_test_1234567890abcdef"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepositTransactionRequest'
 *     responses:
 *       200:
 *         description: Deposit confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Deposit transaction confirmed"
 *               data:
 *                 transactionId: "txn_1234567890"
 *                 status: "success"
 *                 amount: 500
 *               error: null
 *       400:
 *         description: Invalid wallet address or transaction not found
 *       401:
 *         description: Invalid API credentials
 *       500:
 *         description: Internal server error
 */
router.post('/:apiKey/deposite',apiAuth, validateDepositeTransaction, validateRequest,depositeTransaction);

/**
 * @swagger
 * /transaction/{apiKey}/status/{transactionId}:
 *   get:
 *     summary: Check transaction status
 *     description: Get current status and details of a specific transaction
 *     tags: [Transactions]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: apiKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant API key
 *         example: "mk_test_1234567890abcdef"
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID to check
 *         example: "txn_1234567890"
 *     responses:
 *       200:
 *         description: Transaction status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Transaction status retrieved"
 *               data:
 *                 transactionId: "txn_1234567890"
 *                 status: "success"
 *                 amount: 500
 *                 currencyType: "USDT-TRC20"
 *                 monitoring:
 *                   isActive: false
 *               error: null
 *       404:
 *         description: Transaction not found
 *       401:
 *         description: Invalid API credentials
 */
router.get('/:apiKey/status/:transactionId', apiAuth, checkTransactionStatus);

module.exports = router;

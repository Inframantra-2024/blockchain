const express = require('express');
const router = express.Router();
const feeController = require('../controller/feeController');
const {
  createFeeValidator,
  updateFeeValidator,
  feeIdValidator,
  paginationValidator,
} = require('../validations/feevalidation');
const { validateRequest } = require('../middleware/validateIncomingRequest');
const { protect, authorizeRoles } = require('../middleware/routeProtector')

/**
 * @swagger
 * components:
 *   schemas:
 *     Fee:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Fee setting unique identifier
 *         feeType:
 *           type: string
 *           enum: [percentage, flat]
 *           description: Type of fee calculation
 *         value:
 *           type: number
 *           description: Fee value (percentage or flat amount)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateFeeRequest:
 *       type: object
 *       required:
 *         - feeType
 *         - value
 *       properties:
 *         feeType:
 *           type: string
 *           enum: [percentage, flat]
 *           example: "percentage"
 *           description: Type of fee calculation
 *         value:
 *           type: number
 *           example: 5
 *           description: Fee value (5% for percentage, $5 for flat)
 *
 *     UpdateFeeRequest:
 *       type: object
 *       properties:
 *         feeType:
 *           type: string
 *           enum: [percentage, flat]
 *           example: "percentage"
 *           description: Type of fee calculation
 *         value:
 *           type: number
 *           example: 3
 *           description: Fee value (3% for percentage, $3 for flat)
 *
 *     FeeListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Fee'
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

// All routes require admin or superadmin
router.use(protect, authorizeRoles('admin', 'superadmin'));

/**
 * @swagger
 * /fee:
 *   post:
 *     summary: Create new fee setting
 *     description: Admin/SuperAdmin can create new fee settings for withdrawals
 *     tags: [Fee Management]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFeeRequest'
 *     responses:
 *       201:
 *         description: Fee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Fee created successfully"
 *               data:
 *                 _id: "60d5ecb74b24a1234567890a"
 *                 feeType: "percentage"
 *                 value: 5
 *               error: null
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Admin access required
 */
router.post('/', createFeeValidator, validateRequest, feeController.createFee);

/**
 * @swagger
 * /fee:
 *   get:
 *     summary: Get all fee settings
 *     description: Admin/SuperAdmin can view all fee settings with pagination
 *     tags: [Fee Management]
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
 *         description: Fee settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeeListResponse'
 *       401:
 *         description: Unauthorized - Admin access required
 */
router.get('/', paginationValidator, validateRequest, feeController.getFees);

/**
 * @swagger
 * /fee/{id}:
 *   get:
 *     summary: Get fee setting by ID
 *     description: Admin/SuperAdmin can view specific fee setting details
 *     tags: [Fee Management]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fee setting ID
 *         example: "60d5ecb74b24a1234567890a"
 *     responses:
 *       200:
 *         description: Fee setting retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 _id: "60d5ecb74b24a1234567890a"
 *                 feeType: "percentage"
 *                 value: 5
 *               error: null
 *       404:
 *         description: Fee setting not found
 *       401:
 *         description: Unauthorized - Admin access required
 */
router.get('/:id', feeIdValidator, validateRequest, feeController.getFeeById);

/**
 * @swagger
 * /fee/{id}:
 *   put:
 *     summary: Update fee setting
 *     description: Admin/SuperAdmin can update existing fee settings
 *     tags: [Fee Management]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fee setting ID
 *         example: "60d5ecb74b24a1234567890a"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFeeRequest'
 *     responses:
 *       200:
 *         description: Fee setting updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Fee setting not found
 *       401:
 *         description: Unauthorized - Admin access required
 */
router.put('/:id', updateFeeValidator, validateRequest, feeController.updateFee);

/**
 * @swagger
 * /fee/{id}:
 *   delete:
 *     summary: Delete fee setting
 *     description: Admin/SuperAdmin can delete fee settings
 *     tags: [Fee Management]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fee setting ID
 *         example: "60d5ecb74b24a1234567890a"
 *     responses:
 *       200:
 *         description: Fee setting deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Fee deleted successfully"
 *               error: null
 *       404:
 *         description: Fee setting not found
 *       401:
 *         description: Unauthorized - Admin access required
 */
router.delete('/:id', feeIdValidator, validateRequest, feeController.deleteFee);

module.exports = router;

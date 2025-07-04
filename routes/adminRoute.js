// routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const { authorizeRoles, protect } = require('../middleware/routeProtector.js');
const {
  approveMerchant,
  blockMerchant
} = require('../controller/adminController.js');
const {
  approveMerchantValidation
} = require('../validations/merchantVlidator.js');
const { validateRequest } = require('../middleware/validateIncomingRequest.js');

/**
 * @swagger
 * /admin/approve/{userId}:
 *   patch:
 *     summary: Approve merchant account
 *     description: Admin/SuperAdmin can approve pending merchant accounts and generate API credentials
 *     tags: [Admin Management]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant user ID to approve
 *         example: "60d5ecb74b24a1234567890a"
 *     responses:
 *       200:
 *         description: Merchant approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Merchant approved successfully"
 *               data:
 *                 apiKey: "mk_live_1234567890abcdef"
 *                 apiSecret: "sk_live_abcdef1234567890"
 *               error: null
 *       400:
 *         description: Merchant already approved or invalid status
 *       404:
 *         description: Merchant not found
 *       401:
 *         description: Unauthorized - Admin access required
 */
router.patch(
  '/approve/:userId',
  protect,
  authorizeRoles('admin', 'superadmin'),
  approveMerchantValidation,
  validateRequest,
  approveMerchant
);

/**
 * @swagger
 * /admin/block/{userId}:
 *   patch:
 *     summary: Block merchant account
 *     description: Admin/SuperAdmin can block merchant accounts to prevent access
 *     tags: [Admin Management]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Merchant user ID to block
 *         example: "60d5ecb74b24a1234567890a"
 *     responses:
 *       200:
 *         description: Merchant blocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Merchant blocked successfully"
 *               error: null
 *       404:
 *         description: Merchant not found
 *       401:
 *         description: Unauthorized - Admin access required
 */
router.patch(
  '/block/:userId',
  protect,
  authorizeRoles('admin', 'superadmin'),
  approveMerchantValidation,
  validateRequest,
  blockMerchant
);

module.exports = router;

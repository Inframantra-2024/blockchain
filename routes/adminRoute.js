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

// ✅ Approve Merchant
router.patch(
  '/approve/:userId',
  protect,
  authorizeRoles('admin', 'superadmin'),
  approveMerchantValidation,
  validateRequest,
  approveMerchant
);

// ✅ Block Merchant
router.patch(
  '/block/:userId',
  protect,
  authorizeRoles('admin', 'superadmin'),
  approveMerchantValidation,
  validateRequest,
  blockMerchant
);

module.exports = router;

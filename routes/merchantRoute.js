// routes/adminRoutes.js
const express = require('express');
const { authorizeRoles ,protect } = require('../middleware/routeProtector.js');
const { approveMerchant,blockMerchant } = require('../controller/merchantController');
const { approveMerchantValidation } = require('../validations/merchantVlidator.js');
const { validateRequest } = require('../middleware/validateIncomingRequest.js');

const router = express.Router();

router.patch('/approve/:userId', approveMerchantValidation,validateRequest,protect, authorizeRoles('admin', 'superadmin'), approveMerchant);
router.patch('/block/:userId', approveMerchantValidation,validateRequest,protect, authorizeRoles('admin', 'superadmin'), blockMerchant);
module.exports = router;

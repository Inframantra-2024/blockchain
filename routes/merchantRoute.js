
const express = require('express');
const router = express.Router() 
const { getAllMerchants, getMerchantById, getMerchantTransactions } = require('../controller/merchantController.js');
const { validatePagination } = require('../validations/paginationAndFilter.js');
const { validateRequest } = require('../middleware/validateIncomingRequest.js');
const {IdValidator} = require('../validations/merchantVlidator.js')
const { protect, authorizeRoles } = require('../middleware/routeProtector.js');

router.get('/', protect, authorizeRoles('admin', 'superadmin'), validatePagination, validateRequest, getAllMerchants);
router.get('/:merchantId', protect, authorizeRoles('admin', 'superadmin','merchant'),IdValidator,validateRequest, getMerchantById);
router.get('/:merchantId/transactions', protect, authorizeRoles('admin', 'superadmin','merchant'), validatePagination,validateRequest, getMerchantTransactions);

module.exports = router;
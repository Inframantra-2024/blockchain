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

// Initiate withdrawal (merchant)
router.post(
  '/',
  protect,
  authorizeRoles('merchant'),
  withdrawalRequestValidation,
  validateRequest,
  initiateWithdrawal
);

// Approve/Reject (admin/superadmin)
router.patch(
  '/:withdrawalId',
  protect,
  authorizeRoles('admin', 'superadmin'),
  withdrawalActionValidation,
  validateRequest,
  handleWithdrawalStatus
);

// All withdrawals (admin/superadmin)
router.get(
  '/',
  protect,
  authorizeRoles('admin', 'superadmin'),
  validatePagination,
  validateRequest,
  getAllWithdrawals
);

// Merchant withdrawals (admin/superadmin)
router.get(
  '/merchant/:merchantId',
  protect,
  authorizeRoles('admin', 'superadmin'),
  validatePagination,
  validateRequest,
  getMerchantWithdrawals
);

module.exports = router;

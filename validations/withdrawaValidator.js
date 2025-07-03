const { body, param, query } = require('express-validator');

// ✅ Validation for initiating a withdrawal
exports.withdrawalRequestValidation = [
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a number greater than 0'),
  body('feeId')
    .isMongoId()
    .withMessage('Valid fee ID is required'),
];

// ✅ Validation for approving/rejecting a withdrawal via PATCH /:withdrawalId?action=approve/reject
exports.withdrawalActionValidation = [
  param('withdrawalId')
    .isMongoId()
    .withMessage('Valid withdrawal ID is required'),
  query('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be either approve or reject'),
];

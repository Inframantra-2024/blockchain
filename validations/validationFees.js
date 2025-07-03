const { body } = require('express-validator');

exports.feeValidation = [
  body('feeType')
    .exists().withMessage('Fee type is required')
    .isIn(['percentage', 'fixed']).withMessage('Fee type must be either "percentage" or "fixed"'),

  body('value')
    .exists().withMessage('Fee value is required')
    .isFloat({ min: 0 }).withMessage('Fee value must be a non-negative number'),
];

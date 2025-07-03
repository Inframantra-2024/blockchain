const { body, param, query } = require('express-validator');

exports.createFeeValidator = [
  body('feeType')
    .notEmpty().withMessage('Fee type is required')
    .isIn(['percentage', 'flat']).withMessage('Fee type must be percentage or flat'),
  body('value')
    .notEmpty().withMessage('Fee value is required')
    .isNumeric().withMessage('Fee value must be a number'),
];

exports.updateFeeValidator = [
  param('id').isMongoId().withMessage('Invalid fee ID'),
  body('feeType')
    .optional()
    .isIn(['percentage', 'flat']).withMessage('Fee type must be percentage or flat'),
  body('value')
    .optional()
    .isNumeric().withMessage('Fee value must be a number'),
];

exports.feeIdValidator = [
  param('id').isMongoId().withMessage('Invalid fee ID'),
];

exports.paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be >= 1'),
];

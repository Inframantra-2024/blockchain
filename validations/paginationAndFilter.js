const { query } = require('express-validator');

exports.validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'block']).withMessage('Invalid status'),
];
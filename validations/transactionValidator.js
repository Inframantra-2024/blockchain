const { body } = require('express-validator');

exports.depositeTransactionValidator = [
  body('amount')
    .exists().withMessage('Amount is required')
    .isFloat({ gt: 0 }).withMessage('Amount must be a number greater than 0'),

  body('currencyType')
    .exists().withMessage('Currency type is required')
    .isIn(['USDT-TRC20', 'USDT-ERC20']).withMessage('Invalid currency type'),

  body('wallet')
    .exists().withMessage('Wallet address is required')
    .isString().withMessage('Wallet must be a string')
    .notEmpty().withMessage('Wallet address cannot be empty'),
];

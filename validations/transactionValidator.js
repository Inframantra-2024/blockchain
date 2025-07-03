const { body } = require('express-validator');

exports.initiateTransactionValidator = [
  body('amount')
    .exists().withMessage('Amount is required')
    .isFloat({ gt: 0 }).withMessage('Amount must be a number greater than 0'),

  body('currencyType')
    .exists().withMessage('Currency type is required')
    .isIn(['USDT-TRC20', 'USDT-ERC20']).withMessage('Invalid currency type'),

];



exports.validateDepositeTransaction = [
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required'),
];


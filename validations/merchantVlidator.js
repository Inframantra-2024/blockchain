const { body,param } = require('express-validator');

exports.approveMerchantValidation = [
  param('userId', 'Invalid user ID').isMongoId(),
];
exports.blockMerchantValidator = [
  param('userId', 'Invalid merchant user ID')
    .isMongoId()
]
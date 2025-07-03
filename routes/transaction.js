const express = require('express');
const router = express.Router();
const { createTransaction, depositeTransaction} = require('../controller/transactionController');
const {initiateTransactionValidator, validateDepositeTransaction} = require('../validations/transactionValidator')
const { apiAuth } = require('../middleware/VerifyMerchant');
const { validateRequest } = require('../middleware/validateIncomingRequest');

router.get('/:apiKey/create',apiAuth ,initiateTransactionValidator,validateRequest ,createTransaction);
router.post('/:apiKey/deposite',apiAuth, validateDepositeTransaction, validateRequest,depositeTransaction);

module.exports = router;

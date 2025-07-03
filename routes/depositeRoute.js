const express = require('express');
const router = express.Router();
const { createTransaction } = require('../controllers/transactionController');
const { apiAuth } = require('../middleware/apiAuth');

router.post('/api/v1/payments/:apiKey/create', apiAuth, createTransaction);

module.exports = router;

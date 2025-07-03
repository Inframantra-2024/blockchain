const { validationResult } = require('express-validator');
const logger = require('../logger/logger');

exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0]; // Get the first validation error

    // Log the validation error with IP address
    logger.request(req, `Validation failed: ${firstError.msg}`, 'warn');

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: firstError.msg
    });
  }

  next();
};

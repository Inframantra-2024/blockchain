const logger = require('../logger/logger.js');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server Error';

  logger.error(`Error: ${message}`);

  res.status(statusCode).json({
    success: false,
    message: message,
    error: message
  });
};

module.exports = errorHandler;

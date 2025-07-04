const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const logger = require('../logger/logger.js');

exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      logger.warn('Access denied: No token provided');
      return res.status(401).json({ success: false, error: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info(`Token verified for user ID: ${decoded.id}`);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      logger.warn(`User not found for ID: ${decoded.id}`);
      return res.status(401).json({ success: false, error: 'User not found please provide correct headers' });
    }

    req.user = user;
    logger.info(`User authenticated: ${user.email}`);
    next();
  } catch (err) {
    logger.error('Authorization failed:', err.message);
    return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
  }
};
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Role check failed: No user on request');
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
        error: 'No user authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Access denied: ${req.user.email} with role ${req.user.role}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: 'Insufficient permissions'
      });
    }

    logger.info(`Access granted: ${req.user.email} as ${req.user.role}`);
    next();
  };
};


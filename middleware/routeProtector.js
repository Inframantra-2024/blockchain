const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const logger = require('../logger/logger.js');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      logger.warn('Access denied: No token provided');
      return res.status(401).json({ success: false, error: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info(`Token verified for user ID: ${decoded.id}`);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      logger.warn(`User not found for ID: ${decoded.id}`);
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.user = user;
    logger.info(`User authenticated: ${user.email}`);
    next();
  } catch (err) {
    logger.error('Authorization failed:', err.message);
    return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
  }
};

module.exports = { protect };

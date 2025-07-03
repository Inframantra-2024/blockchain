const User = require('../models/user.js');
const generateToken = require('../util/generateToken.js');
const logger = require('../logger/logger.js');
const { error } = require('winston');

// Register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    logger.info(`Attempting to register user: ${email}`);

    const existing = await User.findOne({ email });
    if (existing) {
      logger.warn(`Registration failed: User with email ${email} already exists.`);
      return res.status(400).json({
        success: false,
        message: 'User already exists',
        error: 'User already exists'
      });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'user',
      approved: role === 'merchant' ? 'pending' : 'approved',
    });

    await user.save();
    logger.info(`New ${user.role} registered: ${email}`);

    if (user.role !== 'merchant') {
      generateToken(user, res);
      logger.info(`Token generated for user: ${email}`);
    } else {
      logger.info(`Merchant account pending approval: ${email}`);
    }

    return res.status(201).json({
      success: true,
      message: user.role === 'merchant'
        ? 'Merchant account created. Awaiting admin approval.'
        : 'User registered successfully.',
      error: null
    });
  } catch (err) {
    logger.error(`Registration error: ${err.message}`);
    next(err);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    logger.info(`Login attempt by: ${email}`);

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      logger.warn(`Login failed for ${email}: Invalid credentials`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'Invalid credentials'
      });
    }

    if (user.role === 'merchant' && user.approved !== 'approved') {
      logger.warn(`Login blocked for ${email}: Merchant not approved`);
      return res.status(403).json({
        success: false,
        message: 'Account not approved yet',
        error: 'Account not approved yet'
      });
    }

    generateToken(user, res);
    logger.info(`Login successful for: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      error: null
    });
  } catch (err) {
    logger.error(`Login error for ${req.body.email}: ${err.message}`);
    next(err);
  }
};

// Logout
exports.logout = (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    logger.info('User logged out');
  } else {
    logger.info('Logout attempt without token');
  }

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    error: null
  });
};

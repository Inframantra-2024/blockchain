const User = require('../models/user.js');
const { generateToken }= require('../util/generateToken.js');
const {generateResetTemplate } =  require('../util/generateResetTemplate.js')
const logger = require('../logger/logger.js');
const { error } = require('winston');
const crypto = require('crypto');
const {sendEmail} = require('../util/nodeMailer.js')

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
      role: 'merchant',
      approved:'pending' ,
      tempPassword:password
      
    });

    await user.save();
    logger.info(`New ${user.role} registered: ${email}`);

    if (user.role !== 'merchant') {
      // generateToken(user, res);
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
    console.log(user,res)

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
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    error: null
  });
};

// change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      logger.warn(`Change password failed: User not found`);
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'User not found'
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      logger.warn(`Change password failed for ${user.email}: Incorrect current password`);
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password',
        error: 'Incorrect current password'
      });
    }

    user.password = newPassword; // Will be hashed in pre-save middleware
    await user.save();

    logger.info(`Password changed successfully for user: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      error: null
    });
  } catch (err) {
    logger.error(`Change password error: ${err.message}`);
    next(err);
  }
};

//forgetPassword
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email',
        error: 'User not found'
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Set reset fields
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    // Email link
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const html = generateResetTemplate(user.name, resetUrl);

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Instructions',
      html
    });

    res.json({
      success: true,
      message: 'Password reset email sent',
      error: null
    });
  } catch (err) {
    next(err);
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
        error: 'Invalid token'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful',
      error: null
    });
  } catch (err) {
    next(err);
  }
};



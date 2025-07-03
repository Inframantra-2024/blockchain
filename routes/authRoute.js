const express = require('express');
const router = express.Router();

const { registerValidation, loginValidation, changePasswordValidation, logoutValidation, validateForgot, validateReset } = require('../validations/authValidation.js');
const { validateRequest } = require('../middleware/validateIncomingRequest.js');
const { register, login, logout , changePassword ,forgotPassword , resetPassword} = require('../controller/authController.js');
const { protect ,authorizeRoles } = require('../middleware/routeProtector.js')

// @route   POST /api/auth/register
// @desc    Register a new user or merchant
router.post('/register', protect,authorizeRoles('admin', 'superadmin'),registerValidation, validateRequest, register);

// @route   POST /api/auth/login
// @desc    Login user or merchant
router.post('/login', loginValidation, validateRequest, login);

// @route   POST /api/auth/logout
// @desc    Logout user
router.post('/logout', logoutValidation,validateRequest,logout);

// @route   POST /api/auth/change-password
// @desc    change password
router.put('/change-password', changePasswordValidation,validateRequest,protect, changePassword);


// @route   POST /api/auth/forgot-password
// @desc    cforgot-password
router.post('/forgot-password', validateForgot, validateRequest,forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    reset-password
router.post('/reset-password/:token', validateReset,validateRequest, resetPassword);


module.exports = router;
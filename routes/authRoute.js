const express = require('express');
const router = express.Router();

const { registerValidation, loginValidation } = require('../validations/authValidation.js');
const { validateRequest } = require('../middleware/validateIncomingRequest.js');
const { register, login, logout } = require('../controller/authController.js');


// @route   POST /api/auth/register
// @desc    Register a new user or merchant
router.post('/register', registerValidation, validateRequest, register);

// @route   POST /api/auth/login
// @desc    Login user or merchant
router.post('/login', loginValidation, validateRequest, login);

// @route   POST /api/auth/logout
// @desc    Logout user
router.post('/logout', logout);


module.exports = router;
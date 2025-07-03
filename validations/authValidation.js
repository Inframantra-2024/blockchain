const { body } = require('express-validator');

exports.registerValidation = [
  body('name',     'Name is required').notEmpty(),

  body('email',    'Please include a valid email').isEmail(),

  body('password', 'Password must be 8 or more characters')
    .isLength({ min: 8 }),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true; 
    }),
];


exports.loginValidation = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists(),
];


exports.changePasswordValidation = [
  body('currentPassword', 'Current password is required').notEmpty(),
  body('newPassword', 'New password must be at least 8 characters long').isLength({ min: 8 }),
];


exports.logoutValidation = [
  body().custom((_, { req }) => {
    if (!req.cookies || !req.cookies.token) {
      throw new Error('No token found in cookies for logout');
    }
    return true;
  })
];



exports.validateForgot = [
  body('email').isEmail().withMessage('Valid email is required')
];

exports.validateReset = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];


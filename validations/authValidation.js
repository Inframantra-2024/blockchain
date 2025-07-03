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



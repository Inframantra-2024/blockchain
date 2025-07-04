const express = require('express');
const router = express.Router();

const { registerValidation, loginValidation, changePasswordValidation, logoutValidation, validateForgot, validateReset } = require('../validations/authValidation.js');
const { validateRequest } = require('../middleware/validateIncomingRequest.js');
const { register, login, logout , changePassword ,forgotPassword , resetPassword} = require('../controller/authController.js');
const { protect ,authorizeRoles } = require('../middleware/routeProtector.js')

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: User unique identifier
 *         name:
 *           type: string
 *           maxLength: 50
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         role:
 *           type: string
 *           enum: [merchant, user, admin, superadmin]
 *           default: user
 *           description: User role in the system
 *         approved:
 *           type: string
 *           enum: [pending, approved, rejected, block]
 *           default: pending
 *           description: Approval status for merchants
 *         apiKey:
 *           type: string
 *           description: API key for merchant authentication
 *         walletAddress:
 *           type: string
 *           description: Wallet address for fund releases
 *         totalAmt:
 *           type: number
 *           default: 0
 *           description: Total amount in merchant wallet
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - confirmPassword
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 50
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "password123"
 *         confirmPassword:
 *           type: string
 *           example: "password123"
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           example: "password123"
 *
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *         - confirmPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           example: "oldpassword123"
 *         newPassword:
 *           type: string
 *           minLength: 8
 *           example: "newpassword123"
 *         confirmPassword:
 *           type: string
 *           example: "newpassword123"
 *
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - password
 *         - confirmPassword
 *       properties:
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "newpassword123"
 *         confirmPassword:
 *           type: string
 *           example: "newpassword123"
 *
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *         error:
 *           type: string
 *           nullable: true
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         error:
 *           type: string
 *         errors:
 *           type: string
 *           description: Validation error details
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new merchant
 *     description: Admin/SuperAdmin can register new merchants in the system
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Merchant registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Merchant account created. Awaiting admin approval."
 *               error: null
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Admin/SuperAdmin access required
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.post('/register', protect,authorizeRoles('admin', 'superadmin'),registerValidation, validateRequest, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and receive JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: JWT token set as httpOnly cookie
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Login successful"
 *               data:
 *                 user:
 *                   _id: "60d5ecb74b24a1234567890a"
 *                   name: "John Doe"
 *                   email: "john@example.com"
 *                   role: "merchant"
 *               error: null
 *       401:
 *         description: Invalid credentials or account not approved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Validation error
 */
router.post('/login', loginValidation, validateRequest, login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     description: Clear authentication token and logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Logged out successfully"
 *               error: null
 */
router.post('/logout', logoutValidation,validateRequest,logout);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Change user password
 *     description: Change password for authenticated user
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation error or incorrect current password
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.put('/change-password', changePasswordValidation,validateRequest,protect, changePassword);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Send password reset email to user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
router.post('/forgot-password', validateForgot, validateRequest,forgotPassword);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password with token
 *     description: Reset user password using reset token from email
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token from email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid or expired token
 *       404:
 *         description: User not found
 */
router.post('/reset-password/:token', validateReset,validateRequest, resetPassword);


module.exports = router;
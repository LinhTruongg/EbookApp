const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyForgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  sendRegistrationOTPValidation,
  verifyRegistrationOTPValidation
} = require('../validators/authValidators');

/**
 * @swagger
 * /api/auth/send-registration-otp:
 *   post:
 *     tags: [Authentication]
 *     summary: Send registration OTP
 */
router.post('/send-registration-otp', sendRegistrationOTPValidation, authController.sendRegistrationOTP);

/**
 * @swagger
 * /api/auth/verify-registration-otp:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify registration OTP
 */
router.post('/verify-registration-otp', verifyRegistrationOTPValidation, authController.verifyRegistrationOTP);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - otpToken
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               otpToken:
 *                 type: string
 *               phone:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 */
router.post('/register', registerValidation, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 */
router.post('/login', loginValidation, authController.login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Request password reset
 */
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);

/**
 * @swagger
 * /api/auth/verify-forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify forgot password OTP
 */
router.post('/verify-forgot-password', verifyForgotPasswordValidation, authController.verifyForgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset password with verify token
 */
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Change password (authenticated users)
 *     security:
 *       - bearerAuth: []
 */
router.post('/change-password', authenticateToken, changePasswordValidation, authController.changePassword);

// Support PUT method as used by the mobile app
router.put('/change-password', authenticateToken, changePasswordValidation, authController.changePassword);

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     tags: [Authentication]
 *     summary: Verify email address
 */
router.get('/verify-email/:token', authController.verifyEmail);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
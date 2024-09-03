const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user by sending an OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *             required:
 *               - fullName
 *               - phoneNumber
 *     responses:
 *       201:
 *         description: OTP sent successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and create a user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               otp:
 *                 type: string
 *               pushToken:
 *                 type: string
 *             required:
 *               - phoneNumber
 *               - otp
 *     responses:
 *       200:
 *         description: User created and JWT token returned
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: Server error
 */
router.post('/verify-otp', authController.verifyOtp);

/**
 * @swagger
 * /api/auth/send-otp-login:
 *   post:
 *     summary: Send OTP for login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *             required:
 *               - phoneNumber
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/send-otp-login', authController.sendOtpForLogin);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Verify OTP and log in the user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               otp:
 *                 type: string
 *             required:
 *               - phoneNumber
 *               - otp
 *     responses:
 *       200:
 *         description: User logged in and JWT token returned
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: Server error
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     summary: Get user information from JWT token
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information returned
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/user', authMiddleware, authController.getUser);

/**
 * @swagger
 * /api/auth/user:
 *   put:
 *     summary: Update user information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               expoPushToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: No fields to update
 *       500:
 *         description: Server error
 */
router.put('/user', authMiddleware, authController.editUser);

module.exports = router;
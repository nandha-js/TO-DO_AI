const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/signup  
// @desc    Register a new user  
// @access  Public
router.post('/signup', authController.signup);

// @route   POST /api/auth/login  
// @desc    Login and get JWT token  
// @access  Public
router.post('/login', authController.login);

// @route   POST /api/auth/logout  
// @desc    (Optional) Invalidate token on client side  
// @access  Public
router.post('/logout', authController.logout);

// @route   POST /api/auth/forgot-password  
// @desc    Generate password reset token (returns token in dev, email in prod)  
// @access  Public
router.post('/forgot-password', authController.forgotPassword);

// @route   POST /api/auth/reset-password/:token  
// @desc    Reset password using token from email/link  
// @access  Public
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;

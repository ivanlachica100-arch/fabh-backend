const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  applyLandlord,
  deleteAccount,
  updateDetails,
  sendPasswordOtp,
  updatePassword,
  sendRegisterOtp,
  verifyRegisterOtp,
  verifyDeviceOtp,
  forgotPasswordOtp,
  resetForgotPassword,
  getAllUsersByAdmin,
  deactivateUserByAdmin,
  reactivateUserByAdmin,
} = require('../controllers/authController');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');
const rateLimit = require('express-rate-limit');

// Rate limiters with preflight skip
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skip: (req) => req.method === 'OPTIONS',
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes or reset your password.',
  },
});

const otpRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 6,
  skip: (req) => req.method === 'OPTIONS',
  message: {
    success: false,
    message: 'Too many verification code requests. Please wait a few minutes.',
  },
});

// Registration Flow
router.post('/send-register-otp', otpRequestLimiter, sendRegisterOtp);
router.post('/verify-register-otp', authLimiter, verifyRegisterOtp);
router.post('/register', authLimiter, register);

// Login & MFA Flow
router.post('/login', authLimiter, login);
router.post('/verify-device-otp', authLimiter, verifyDeviceOtp);

// Public Forgot Password Recovery Flow
router.post('/forgot-password-otp', otpRequestLimiter, forgotPasswordOtp);
router.post('/reset-forgot-password', authLimiter, resetForgotPassword);

// Session Management
router.get('/me', protect, getMe);
router.get('/logout', logout);

// In-App Authenticated Password Update
router.post('/send-password-otp', protect, otpRequestLimiter, sendPasswordOtp);
router.put('/update-password', protect, updatePassword);

// Profile & Account Management
router.put('/update-details', protect, updateDetails);
router.delete('/delete-account', protect, deleteAccount);

// Landlord Verification Upload
router.post(
  '/apply-landlord',
  protect,
  authorize('student'),
  upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'ownershipDocument', maxCount: 1 },
  ]),
  applyLandlord
);

// Administrative User Management
router.get('/admin/users', protect, authorize('admin'), getAllUsersByAdmin);
router.put('/admin/users/:id/deactivate', protect, authorize('admin'), deactivateUserByAdmin);
router.put('/admin/users/:id/reactivate', protect, authorize('admin'), reactivateUserByAdmin);

module.exports = router;
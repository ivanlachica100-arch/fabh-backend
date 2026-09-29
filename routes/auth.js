const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { 
  register, 
  sendRegisterOtp,
  verifyRegisterOtp,
  login, 
  verifyDeviceOtp,
  logout, 
  getMe, 
  applyLandlord,
  updateDetails,
  sendPasswordOtp,
  updatePassword,
  deleteAccount,
  deactivateUserByAdmin,
  getAllUsersByAdmin,
  reactivateUserByAdmin,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');

// Rate limiter: Max 10 attempts per 15 minutes for credential/verification checks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

// Rate limiter: Max 5 OTP code requests per 15 minutes to prevent email spamming
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification code requests. Please wait 15 minutes before requesting again.',
  },
});

// Public Standard & OTP Routes (Rate-Protected)
router.post('/register', register);
router.post('/send-register-otp', otpRequestLimiter, sendRegisterOtp);
router.post('/verify-register-otp', authLimiter, verifyRegisterOtp);

router.post('/login', authLimiter, login);
router.post('/verify-device-otp', authLimiter, verifyDeviceOtp);
router.get('/logout', logout);

// Protected session route
router.get('/me', protect, getMe);

// Settings modal routes with OTP protection
router.put('/update-details', protect, updateDetails);
router.post('/send-password-otp', protect, otpRequestLimiter, sendPasswordOtp);
router.put('/update-password', protect, updatePassword);
router.delete('/delete-account', protect, deleteAccount);

// Admin User Moderation Endpoints
router.get('/admin/users', protect, authorize('admin'), getAllUsersByAdmin);
router.put('/admin/users/:id/deactivate', protect, authorize('admin'), deactivateUserByAdmin);
router.put('/admin/users/:id/reactivate', protect, authorize('admin'), reactivateUserByAdmin);

// Multipart file upload for Landlord Application
router.post(
  '/apply-landlord',
  protect,
  upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'ownershipDocument', maxCount: 1 },
  ]),
  applyLandlord
);

// Landlord/Admin Protected Route
router.get('/landlord-only', protect, authorize('landlord', 'admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Landlord/Admin!',
  });
});

module.exports = router;
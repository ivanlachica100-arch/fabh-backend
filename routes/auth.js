const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  getMe, 
  applyLandlord 
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

// Protected session route
router.get('/me', protect, getMe);

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

// Example landlord-only protected route
router.get('/landlord-only', protect, authorize('landlord', 'admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Landlord/Admin!',
  });
});

module.exports = router;
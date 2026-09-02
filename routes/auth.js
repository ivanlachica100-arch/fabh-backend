const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

// Example protected route to test RBAC & Auth
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// Example landlord-only protected route
router.get('/landlord-only', protect, authorize('landlord', 'admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Landlord/Admin!',
  });
});

module.exports = router;
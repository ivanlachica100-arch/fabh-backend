const express = require('express');
const router = express.Router();
const {
  getPendingLandlordApplications,
  reviewLandlordApplication,
  getAuditLogs,
  getAnalytics,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin authority
router.use(protect);
router.use(authorize('admin'));

// Analytics Dashboard Endpoint
router.get('/analytics', getAnalytics);

// Landlord Applications Endpoints (supporting both formats)
router.get('/applications', getPendingLandlordApplications);
router.get('/landlord-applications', getPendingLandlordApplications);

router.put('/applications/:userId/review', reviewLandlordApplication);
router.put('/applications/:userId', reviewLandlordApplication);
router.put('/landlord-applications/:userId/review', reviewLandlordApplication);
router.put('/landlord-applications/:userId', reviewLandlordApplication);

// Security & Audit Logs
router.get('/logs', getAuditLogs);

module.exports = router;
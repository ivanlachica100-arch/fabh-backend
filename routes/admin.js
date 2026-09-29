const express = require('express');
const router = express.Router();
const {
  getPendingLandlordApplications,
  reviewLandlordApplication,
  getAuditLogs,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes in this router require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Support both /applications and /landlord-applications
router.get('/applications', getPendingLandlordApplications);
router.get('/landlord-applications', getPendingLandlordApplications);

// Review endpoints
router.put('/applications/:userId/review', reviewLandlordApplication);
router.put('/landlord-applications/:userId/review', reviewLandlordApplication);

router.get('/logs', getAuditLogs);

module.exports = router;
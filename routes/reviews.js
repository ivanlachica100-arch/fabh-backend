const express = require('express');
const router = express.Router({ mergeParams: true });
const { addReview, getReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(getReviews)
  .post(protect, authorize('student', 'admin'), addReview);

module.exports = router;
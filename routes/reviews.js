const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getReviews,
  addReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Route: /api/boarding-houses/:boardingHouseId/reviews
router
  .route('/')
  .get(getReviews)
  .post(protect, addReview);

router
  .route('/:id')
  .delete(protect, deleteReview);

module.exports = router;
// controllers/reviewController.js
const Review = require('../models/Review');
const BoardingHouse = require('../models/BoardingHouse');
const Notification = require('../models/Notification');

// @desc    Get all reviews for a boarding house
// @route   GET /api/boarding-houses/:boardingHouseId/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ boardingHouse: req.params.boardingHouseId })
      .populate('student', 'name email role')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add review for a boarding house
// @route   POST /api/boarding-houses/:boardingHouseId/reviews
// @access  Private (Student)
exports.addReview = async (req, res) => {
  try {
    req.body.boardingHouse = req.params.boardingHouseId;
    req.body.student = req.user._id || req.user.id;

    const house = await BoardingHouse.findById(req.params.boardingHouseId);
    if (!house) {
      return res.status(404).json({ success: false, message: 'Boarding house not found' });
    }

    const review = await Review.create(req.body);

    // Notify the Landlord if the listing has an assigned landlord
    if (house.landlord) {
      try {
        await Notification.create({
          recipient: house.landlord,
          title: 'New Student Review Received',
          message: `A student left a ${req.body.rating}-star review on "${house.title || 'your listing'}".`,
          type: 'info',
        });
      } catch (notifErr) {
        console.warn('Failed to dispatch landlord notification:', notifErr.message);
      }
    }

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this boarding house',
      });
    }
    console.error('Add review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/boarding-houses/:boardingHouseId/reviews/:id
// @access  Private (Author or Admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const currentUserId = (req.user._id || req.user.id).toString();
    if (review.student.toString() !== currentUserId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review removed' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
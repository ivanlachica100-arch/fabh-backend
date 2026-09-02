const Review = require('../models/Review');
const BoardingHouse = require('../models/BoardingHouse');

// @desc    Add a review for a boarding house
// @route   POST /api/boarding-houses/:boardingHouseId/reviews
// @access  Private (Students only)
const addReview = async (req, res) => {
  try {
    req.body.boardingHouse = req.params.boardingHouseId;
    req.body.student = req.user._id;

    const house = await BoardingHouse.findById(req.params.boardingHouseId);
    if (!house) {
      return res.status(404).json({ success: false, message: 'Boarding house not found' });
    }

    const review = await Review.create(req.body);

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
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a boarding house
// @route   GET /api/boarding-houses/:boardingHouseId/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ boardingHouse: req.params.boardingHouseId })
      .populate({
        path: 'student',
        select: 'name',
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addReview,
  getReviews,
};
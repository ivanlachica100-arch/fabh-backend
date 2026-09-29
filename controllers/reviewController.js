// controllers/reviewController.js
const Review = require('../models/Review');
const BoardingHouse = require('../models/BoardingHouse');
const Notification = require('../models/Notification'); // <--- add import

const addReview = async (req, res) => {
  try {
    req.body.boardingHouse = req.params.boardingHouseId;
    req.body.student = req.user._id;

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
    res.status(500).json({ success: false, message: error.message });
  }
};
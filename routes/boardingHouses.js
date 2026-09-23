const express = require('express');
const router = express.Router();

const {
  createListing,
  getListings,
  getMyListings,
  updateListing,
  deleteListing,
  compareListings,
} = require('../controllers/boardingHouseController');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');

router.get('/', getListings);
router.post(
  '/',
  protect,
  authorize('landlord', 'admin'),
  upload.array('images', 5),
  createListing
);

router.post('/compare', compareListings);
router.get('/my-listings', protect, authorize('landlord', 'admin'), getMyListings);

router.put('/:id', protect, authorize('landlord', 'admin'), updateListing);
router.delete('/:id', protect, authorize('landlord', 'admin'), deleteListing);

module.exports = router;
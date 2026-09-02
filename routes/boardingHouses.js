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

router.get('/', getListings);
router.post('/', protect, authorize('landlord', 'admin'), createListing);

router.get('/my-listings', protect, authorize('landlord', 'admin'), getMyListings);

router.put('/:id', protect, authorize('landlord', 'admin'), updateListing);
router.delete('/:id', protect, authorize('landlord', 'admin'), deleteListing);
router.post('/compare', compareListings);
module.exports = router;
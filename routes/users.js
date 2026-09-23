const express = require('express');
const router = express.Router();
const { 
  applyForLandlord, 
  toggleBookmark, 
  getBookmarks 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../utils/upload');

// Student submits landlord application with physical image files
router.post(
  '/apply-landlord',
  protect,
  upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'ownershipDocument', maxCount: 1 },
  ]),
  applyForLandlord
);

// Student Saved Bookmarks Routes
router.get('/bookmarks', protect, getBookmarks);
router.put('/bookmarks/:houseId', protect, toggleBookmark);

module.exports = router;
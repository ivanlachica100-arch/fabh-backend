// controllers/userController.js
const User = require('../models/User');
const logActivity = require('../utils/logger');

// POST /api/auth/register
// Force role to 'student' regardless of client payload
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'student', // Hardened default
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// POST /api/users/apply-landlord
// Logged-in user submits proof documents
exports.applyForLandlord = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { contactNumber, governmentIdType } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'landlord') {
      return res.status(400).json({ success: false, message: 'Account is already an approved landlord.' });
    }

    if (user.landlordApplication?.status === 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Your application is already pending admin review.' 
      });
    }

    // Extract saved image filepaths from multer
    const idDocumentFile = req.files?.idDocument?.[0];
    const ownershipDocumentFile = req.files?.ownershipDocument?.[0];

    // Fallback allows string URLs if needed for backwards compatibility
    const idDocumentUrl = idDocumentFile 
      ? `/uploads/${idDocumentFile.filename}` 
      : req.body.idDocumentUrl;

    const ownershipDocumentUrl = ownershipDocumentFile 
      ? `/uploads/${ownershipDocumentFile.filename}` 
      : req.body.ownershipDocumentUrl;

    if (!idDocumentUrl) {
      return res.status(400).json({ success: false, message: 'Please upload a photo of your Government ID.' });
    }

    if (!ownershipDocumentUrl) {
      return res.status(400).json({ success: false, message: 'Please upload a photo of your Property proof or permit.' });
    }

    user.landlordApplication = {
      status: 'pending',
      contactNumber: contactNumber?.trim() || null,
      governmentIdType: governmentIdType || 'UMID',
      idDocumentUrl,
      ownershipDocumentUrl,
      rejectionReason: null,
      appliedAt: new Date(),
    };

    await user.save();

    // Log the landlord application submission
    await logActivity({
      action: 'LANDLORD_APPLY',
      userId: user._id,
      userEmail: user.email,
      details: `Submitted landlord verification documents (${governmentIdType || 'ID'}).`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Application submitted! An admin will review and verify your property documents.',
      application: user.landlordApplication,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/bookmarks/:houseId
// Toggle bookmark for a boarding house
exports.toggleBookmark = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { houseId } = req.params;
    const isBookmarked = user.savedBoardingHouses?.some(
      (id) => id.toString() === houseId
    );

    if (isBookmarked) {
      user.savedBoardingHouses = user.savedBoardingHouses.filter(
        (id) => id.toString() !== houseId
      );
    } else {
      if (!user.savedBoardingHouses) user.savedBoardingHouses = [];
      user.savedBoardingHouses.push(houseId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      savedBoardingHouses: user.savedBoardingHouses,
      isBookmarked: !isBookmarked,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/bookmarks
// Retrieve full details of student saved dorms
exports.getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('savedBoardingHouses');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user.savedBoardingHouses || [],
    });
  } catch (err) {
    next(err);
  }
};
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logActivity = require('../utils/logger');

// Helper to sign JWT and set HTTP-only cookie
const sendTokenResponse = (user, statusCode, res) => {
  const secret = process.env.JWT_SECRET || 'fabh_capstone_secret_key_2026';
  const token = jwt.sign(
    { id: user._id, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        landlordApplication: user.landlordApplication || { status: 'none' },
      },
    });
};

// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Inside exports.register in controllers/authController.js:
const nameRegex = /^[a-zA-Z\s.-]{2,50}$/;
if (!nameRegex.test(name.trim())) {
  return res.status(400).json({ 
    success: false, 
    message: 'Name can only contain letters, spaces, hyphens, or periods (no numbers or special characters).' 
  });
}

    // All standard registrations are students by default
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'student',
      landlordApplication: { status: 'none' },
    });

    // Record audit log entry
    await logActivity({
      action: 'USER_REGISTER',
      userId: user._id,
      userEmail: user.email,
      details: `Registered new account with role: ${user.role}`,
      req,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Record audit log entry
    await logActivity({
      action: 'USER_LOGIN',
      userId: user._id,
      userEmail: user.email,
      details: 'User authenticated successfully',
      req,
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User session not found' });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        landlordApplication: user.landlordApplication || { status: 'none' },
      },
    });
  } catch (error) {
    console.error('Session verify error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/auth/logout
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Apply as Landlord with physical ID and Ownership document uploads
// @route   POST /api/auth/apply-landlord
// @access  Private (Student)
exports.applyLandlord = async (req, res) => {
  try {
    const { contactNumber, governmentIdType } = req.body;

    if (!contactNumber || !governmentIdType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your contact number and ID type.',
      });
    }

    const idFile = req.files?.['idDocument']?.[0];
    const propertyFile = req.files?.['ownershipDocument']?.[0];

    if (!idFile || !propertyFile) {
      return res.status(400).json({
        success: false,
        message: 'Please upload both your Government ID and Property Permit/Document.',
      });
    }

    const idDocumentUrl = `/uploads/${idFile.filename}`;
    const ownershipDocumentUrl = `/uploads/${propertyFile.filename}`;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.landlordApplication = {
      status: 'pending',
      contactNumber: contactNumber.trim(),
      governmentIdType,
      idDocumentUrl,
      ownershipDocumentUrl,
      appliedAt: new Date(),
    };

    await user.save();

    await logActivity({
      action: 'LANDLORD_APPLY',
      userId: user._id,
      userEmail: user.email,
      details: `Submitted landlord application with uploaded documents (${governmentIdType})`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Application submitted! An admin will review and verify your property documents.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        landlordApplication: user.landlordApplication,
      },
    });
  } catch (error) {
    console.error('Apply landlord error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
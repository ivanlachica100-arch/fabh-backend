const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logActivity = require('../utils/logger');
const { sendOtpEmail } = require('../utils/mailer');
const bcrypt = require('bcryptjs');

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
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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

// @desc    Step 1: Validate Registration Details & Send 6-Digit Email OTP
// @route   POST /api/auth/send-register-otp
exports.sendRegisterOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const nameRegex = /^[a-zA-Z\s.-]{2,50}$/;
    if (!nameRegex.test(name.trim())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name can only contain letters, spaces, hyphens, or periods.' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Generate 6-digit numeric OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(rawOtp, salt);

    // Save temporary unverified user or update if already pending
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      user = new User({
        name: name.trim(),
        email: cleanEmail,
        password,
        role: 'student',
        isEmailVerified: false,
        otpCode: hashedOtp,
        otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        landlordApplication: { status: 'none' },
      });
    } else {
      user.name = name.trim();
      user.password = password;
      user.otpCode = hashedOtp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    }

    await user.save();
    await sendOtpEmail(cleanEmail, rawOtp, 'Account Registration');

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email address.',
    });
  } catch (error) {
    console.error('Send register OTP error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Step 2: Verify Registration OTP & Complete Account Setup
// @route   POST /api/auth/verify-register-otp
exports.verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+otpCode +otpExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Registration session not found.' });
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp.trim(), user.otpCode);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit verification code.' });
    }

    // Activate user and record the current device
    user.isEmailVerified = true;
    user.otpCode = null;
    user.otpExpires = null;

    const userAgent = req.headers['user-agent'] || 'unknown';
    if (!user.knownDevices.includes(userAgent)) {
      user.knownDevices.push(userAgent);
    }

    await user.save();

    await logActivity({
      action: 'USER_REGISTER_VERIFIED',
      userId: user._id,
      userEmail: user.email,
      details: 'Account successfully registered and verified via email OTP',
      req,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Verify register OTP error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Standard Direct Registration (Backward Compatibility Fallback)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const nameRegex = /^[a-zA-Z\s.-]{2,50}$/;
    if (!nameRegex.test(name.trim())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name can only contain letters, spaces, hyphens, or periods.' 
      });
    }

    const userAgent = req.headers['user-agent'] || 'unknown';

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'student',
      isEmailVerified: true,
      knownDevices: [userAgent],
      landlordApplication: { status: 'none' },
    });

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

// @desc    Adaptive Login with Device MFA Challenge
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const userAgent = req.headers['user-agent'] || 'unknown';

    // ADMIN ALWAYS BYPASSES DEVICE CHECKS TO PREVENT DEFENSE LOCKOUTS
    if (user.role === 'admin') {
      await logActivity({
        action: 'ADMIN_LOGIN',
        userId: user._id,
        userEmail: user.email,
        details: 'Admin authenticated successfully (Adaptive MFA Bypassed)',
        req,
      });
      return sendTokenResponse(user, 200, res);
    }

    // Adaptive Device Verification Check
    const isKnownDevice = user.knownDevices && user.knownDevices.includes(userAgent);

    if (!isKnownDevice && user.knownDevices && user.knownDevices.length > 0) {
      const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const salt = await bcrypt.genSalt(10);
      user.otpCode = await bcrypt.hash(rawOtp, salt);
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      await sendOtpEmail(cleanEmail, rawOtp, 'New Device Login Challenge');

      return res.status(200).json({
        success: true,
        requireDeviceOtp: true,
        email: user.email,
        message: 'New device detected. A 6-digit verification code has been dispatched to your Gmail.',
      });
    }

    // If first login or recognized device, record footprint and log in
    if (!user.knownDevices.includes(userAgent)) {
      user.knownDevices.push(userAgent);
      await user.save();
    }

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

// @desc    Verify New Device OTP Challenge
// @route   POST /api/auth/verify-device-otp
exports.verifyDeviceOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+otpCode +otpExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired.' });
    }

    const isMatch = await bcrypt.compare(otp.trim(), user.otpCode);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    user.otpCode = null;
    user.otpExpires = null;

    const userAgent = req.headers['user-agent'] || 'unknown';
    if (!user.knownDevices.includes(userAgent)) {
      user.knownDevices.push(userAgent);
    }

    await user.save();

    await logActivity({
      action: 'DEVICE_VERIFIED_LOGIN',
      userId: user._id,
      userEmail: user.email,
      details: 'User completed adaptive MFA for newly trusted device',
      req,
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Device OTP verify error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send OTP to Authorized User for Password Change
// @route   POST /api/auth/send-password-otp
// @access  Private
exports.sendPasswordOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User session not found.' });
    }

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    user.otpCode = await bcrypt.hash(rawOtp, salt);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendOtpEmail(user.email, rawOtp, 'Password Change Verification');

    res.status(200).json({
      success: true,
      message: `Verification code sent to ${user.email}`,
    });
  } catch (error) {
    console.error('Send password OTP error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Password (Verified with Current Password & Email OTP)
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, otp } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user.id || req.user._id).select('+password +otpCode +otpExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect current password.',
      });
    }

    // If an OTP was requested, verify it
    if (otp) {
      if (!user.otpExpires || user.otpExpires < new Date()) {
        return res.status(400).json({ success: false, message: 'OTP has expired. Request a new code.' });
      }

      const isOtpValid = await bcrypt.compare(otp.trim(), user.otpCode);
      if (!isOtpValid) {
        return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
      }

      user.otpCode = null;
      user.otpExpires = null;
    }

    user.password = newPassword;
    await user.save();

    await logActivity({
      action: 'USER_PASSWORD_CHANGE',
      userId: user._id,
      userEmail: user.email,
      details: `Password changed for user ${user.email}`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully!',
    });
  } catch (error) {
    console.error('Update password error:', error);
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

// @desc    Apply as Landlord
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

    const user = await User.findById(req.user._id || req.user.id);
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
// @desc    Permanently delete own user account (DPA 2012 compliance)
// @route   DELETE /api/auth/delete-account
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your password to confirm account deletion.',
      });
    }

    const user = await User.findById(req.user.id || req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Protect master admin from accidental deletion
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin root accounts cannot be deleted.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Account deletion aborted.',
      });
    }

    // Record audit trail before deletion
    await logActivity({
      action: 'USER_ACCOUNT_DELETED',
      userId: user._id,
      userEmail: user.email,
      details: `User requested permanent account deletion under Data Privacy Act.`,
      req,
    });

    await User.findByIdAndDelete(user._id);

    // Clear session cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Your account and personal data have been permanently deleted.',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile name
// @route   PUT /api/auth/update-details
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long.',
      });
    }

    const nameRegex = /^[a-zA-Z\s.-]{2,50}$/;
    if (!nameRegex.test(name.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Name can only contain letters, spaces, hyphens, or periods.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id || req.user._id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await logActivity({
      action: 'USER_PROFILE_UPDATE',
      userId: user._id,
      userEmail: user.email,
      details: `User updated name to: ${user.name}`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        landlordApplication: user.landlordApplication || { status: 'none' },
      },
    });
  } catch (error) {
    console.error('Update details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin fetch all registered users for moderation
// @route   GET /api/auth/admin/users
// @access  Private (Admin Only)
exports.getAllUsersByAdmin = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('name email role isDeactivated deactivationReason deactivatedAt createdAt')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin deactivates/bans user account and sends reason via email
// @route   PUT /api/auth/admin/users/:id/deactivate
// @access  Private (Admin Only)
exports.deactivateUserByAdmin = async (req, res) => {
  try {
    const { reason } = req.body;
    const { id } = req.params;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a clear reason (minimum 5 characters).',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be deactivated.',
      });
    }

    user.isDeactivated = true;
    user.deactivationReason = reason.trim();
    user.deactivatedAt = new Date();
    await user.save();

    // Mail notice / console fallback
    try {
      const { sendAccountDeactivationEmail } = require('../utils/mailer');
      if (typeof sendAccountDeactivationEmail === 'function') {
        await sendAccountDeactivationEmail(user.email, reason.trim());
      }
    } catch (mailErr) {
      console.warn('Mail notification notice skipped/logged:', mailErr.message);
    }

    await logActivity({
      action: 'ADMIN_DEACTIVATE_USER',
      userId: req.user._id,
      userEmail: req.user.email,
      details: `Deactivated user ${user.email}. Reason: ${reason.trim()}`,
      req,
    });

    res.status(200).json({
      success: true,
      message: `User ${user.email} has been deactivated.`,
      user: {
        id: user._id,
        email: user.email,
        isDeactivated: user.isDeactivated,
      },
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin reactivates a previously deactivated user
// @route   PUT /api/auth/admin/users/:id/reactivate
// @access  Private (Admin Only)
exports.reactivateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isDeactivated = false;
    user.deactivationReason = null;
    user.deactivatedAt = null;
    await user.save();

    await logActivity({
      action: 'ADMIN_REACTIVATE_USER',
      userId: req.user._id,
      userEmail: req.user.email,
      details: `Reactivated user ${user.email} (${user._id})`,
      req,
    });

    res.status(200).json({
      success: true,
      message: `User ${user.email} has been reinstated successfully.`,
      user,
    });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


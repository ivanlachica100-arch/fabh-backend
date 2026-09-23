// controllers/adminController.js
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const logActivity = require('../utils/logger');

// GET /api/admin/landlord-applications
exports.getPendingLandlordApplications = async (req, res, next) => {
  try {
    const pendingApplicants = await User.find({
      'landlordApplication.status': 'pending',
    }).select('name email landlordApplication createdAt');

    res.status(200).json({
      success: true,
      count: pendingApplicants.length,
      data: pendingApplicants,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/logs
exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/landlord-applications/:userId/review
exports.reviewLandlordApplication = async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'
    const targetUser = await User.findById(req.params.userId);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Applicant not found' });
    }

    if (targetUser.landlordApplication?.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'No pending application for this user' });
    }

    if (action === 'approve') {
      targetUser.role = 'landlord';
      targetUser.landlordApplication.status = 'approved';
      targetUser.landlordApplication.reviewedAt = new Date();
      targetUser.landlordApplication.reviewedBy = req.user.id;
    } else if (action === 'reject') {
      targetUser.landlordApplication.status = 'rejected';
      targetUser.landlordApplication.rejectionReason = rejectionReason || 'Documentation did not meet criteria.';
      targetUser.landlordApplication.reviewedAt = new Date();
      targetUser.landlordApplication.reviewedBy = req.user.id;
    } else {
      return res.status(400).json({ success: false, message: 'Action must be approve or reject' });
    }

    await targetUser.save();

    // Log the approval or rejection
    await logActivity({
      action: action === 'approve' ? 'LANDLORD_APPROVED' : 'LANDLORD_REJECTED',
      userId: req.user.id,
      userEmail: req.user.email,
      details: `${action === 'approve' ? 'Approved' : 'Rejected'} landlord application for ${targetUser.email}.`,
      req,
    });

    res.status(200).json({
      success: true,
      message: `Landlord application ${action}d successfully.`,
      user: {
        id: targetUser._id,
        role: targetUser.role,
        status: targetUser.landlordApplication.status,
      },
    });
  } catch (err) {
    next(err);
  }
};
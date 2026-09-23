const AuditLog = require('../models/AuditLog');

const logActivity = async ({ action, req, userId = null, userEmail = null, details }) => {
  try {
    const email = userEmail || req?.user?.email || 'Anonymous';
    const id = userId || req?.user?._id || null;
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || null;

    await AuditLog.create({
      action,
      performedBy: id,
      userEmail: email,
      details,
      ipAddress,
    });
  } catch (err) {
    // Non-blocking: failures to write audit entries won't interrupt core operations
    console.error('Audit log write error:', err.message);
  }
};

module.exports = logActivity;
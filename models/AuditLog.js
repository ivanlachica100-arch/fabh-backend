const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'USER_REGISTER',
        'USER_LOGIN',
        'ADMIN_LOGIN',
        'USER_LOGOUT',
        'LISTING_CREATE',
        'LISTING_UPDATE',
        'LISTING_DELETE',
        'ADMIN_DELETE_PROPERTY',
        'LANDLORD_DELETE_PROPERTY',
        'COMPARE_LISTINGS',
        'TOPSIS_COMPARE',
        'LANDLORD_APPLICATION_SUBMIT',
        'LANDLORD_APPROVED',
        'LANDLORD_REJECTED',
        'ADMIN_DEACTIVATE_USER',
        'ADMIN_REACTIVATE_USER',
        'PROFILE_UPDATE',
      ],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userEmail: {
      type: String,
      default: 'Anonymous / System',
    },
    details: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: 'Unknown',
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
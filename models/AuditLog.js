const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'USER_REGISTER',
        'USER_LOGIN',
        'LANDLORD_APPLY',
        'LANDLORD_APPROVED',
        'LANDLORD_REJECTED',
        'LISTING_CREATED',
        'LISTING_DELETED',
      ],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userEmail: {
      type: String,
      default: 'System',
    },
    details: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
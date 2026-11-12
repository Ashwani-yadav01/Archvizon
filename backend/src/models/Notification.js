const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient ID is required'],
      index: true
    },
    type: {
      type: String,
      enum: [
        'PROJECT_SUBMITTED',
        'PROJECT_ASSIGNED',
        'STATUS_CHANGED',
        'CLARIFICATION_REQUESTED',
        'DELIVERABLE_UPLOADED',
        'REVISION_REQUESTED',
        'REVISION_RESPONDED',
        'DELIVERABLE_APPROVED'
      ],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    relatedProjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      index: true
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

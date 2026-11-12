const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      enum: ['PROJECT', 'DELIVERABLE', 'REVISION', 'ASSIGNMENT', 'ASSET', 'COMMENT'],
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;

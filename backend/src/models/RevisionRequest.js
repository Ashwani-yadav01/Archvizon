const mongoose = require('mongoose');

const revisionRequestSchema = new mongoose.Schema(
  {
    deliverableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deliverable',
      required: [true, 'Deliverable ID is required'],
      index: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      required: [true, 'Revision description is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'DECLINED'],
      default: 'OPEN'
    },
    response: {
      message: { type: String, default: '' },
      respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      respondedAt: { type: Date }
    }
  },
  {
    timestamps: true
  }
);

const RevisionRequest = mongoose.model('RevisionRequest', revisionRequestSchema);

module.exports = RevisionRequest;

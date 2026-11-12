const mongoose = require('mongoose');

const deliverableSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true
    },
    serviceRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest'
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset ID is required']
    },
    deliverableType: {
      type: String,
      enum: ['IMAGE_RENDER', 'STAGED_IMAGE', 'WALKTHROUGH_VIDEO', 'PANORAMA_360', 'MODEL_3D'],
      required: true
    },
    version: {
      type: Number,
      required: true,
      default: 1
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reviewStatus: {
      type: String,
      enum: ['PENDING_INTERNAL_REVIEW', 'READY_FOR_CLIENT', 'REVISION_REQUESTED', 'APPROVED'],
      default: 'PENDING_INTERNAL_REVIEW',
      index: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Deliverable = mongoose.model('Deliverable', deliverableSchema);

module.exports = Deliverable;

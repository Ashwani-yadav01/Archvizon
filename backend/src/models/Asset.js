const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
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
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader user ID is required']
    },
    storageKey: {
      type: String,
      required: [true, 'Storage key is required']
    },
    originalName: {
      type: String,
      required: [true, 'Original filename is required']
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      enum: ['SOURCE_FILE', 'REFERENCE_IMAGE', 'PREVIEW', 'FINAL_DELIVERABLE'],
      default: 'SOURCE_FILE'
    },
    version: {
      type: Number,
      default: 1
    },
    visibility: {
      type: String,
      enum: ['INTERNAL', 'CLIENT_VISIBLE', 'PUBLIC'],
      default: 'CLIENT_VISIBLE'
    }
  },
  {
    timestamps: true
  }
);

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;

const mongoose = require('mongoose');

const stagingJobSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    originalImageUrl: {
      type: String,
      required: [true, 'Original room photograph is required']
    },
    roomType: {
      type: String,
      enum: ['LIVING_ROOM', 'BEDROOM', 'KITCHEN', 'DINING_ROOM', 'OFFICE', 'HOME_OFFICE', 'TERRACE', 'OTHER'],
      default: 'LIVING_ROOM'
    },
    designStyle: {
      type: String,
      enum: [
        'MODERN',
        'CONTEMPORARY',
        'MINIMALIST',
        'SCANDINAVIAN',
        'INDUSTRIAL',
        'TRADITIONAL',
        'LUXURY',
        'JAPANDI'
      ],
      default: 'MODERN'
    },
    preferences: {
      furnitureDensity: { type: String, default: 'BALANCED' },
      colorPalette: { type: String, default: 'Neutral Warm' },
      customNotes: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    progress: {
      type: Number,
      default: 0
    },
    resultImageUrl: {
      type: String,
      default: ''
    },
    provider: {
      type: String,
      default: 'ARCHVIZON_VISUAL_PROCESSING_ENGINE'
    },
    providerJobId: {
      type: String,
      default: ''
    },
    errorDetails: {
      type: String,
      default: ''
    },
    processingDurationMs: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const StagingJob = mongoose.model('StagingJob', stagingJobSchema);

module.exports = StagingJob;

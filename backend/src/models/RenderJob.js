const mongoose = require('mongoose');

const renderJobSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    sceneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scene',
      default: null,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    settings: {
      resolution: {
        type: String,
        enum: ['FHD', '4K', '8K'],
        default: '4K'
      },
      quality: {
        type: String,
        enum: ['DRAFT', 'PRODUCTION', 'ULTRA'],
        default: 'PRODUCTION'
      },
      cameraPreset: {
        type: String,
        enum: ['PERSPECTIVE', 'ISOMETRIC', 'FRONT', 'TOP', 'WIDE_ANGLE'],
        default: 'PERSPECTIVE'
      },
      cameraPosition: {
        type: [Number],
        default: [9, 7, 9]
      },
      cameraTarget: {
        type: [Number],
        default: [0, 1, 0]
      },
      fov: {
        type: Number,
        default: 55
      },
      lightingScenario: {
        type: String,
        enum: ['DAY', 'GOLDEN_HOUR', 'DRAMATIC_NIGHT', 'STUDIO'],
        default: 'DAY'
      },
      sunIntensity: {
        type: Number,
        default: 1.2
      },
      samples: {
        type: Number,
        default: 64
      }
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
    outputUrl: {
      type: String,
      default: ''
    },
    thumbnailUrl: {
      type: String,
      default: ''
    },
    engineUsed: {
      type: String,
      default: 'ARCHVIZON_HEADLESS_RENDERER'
    },
    errorDetails: {
      type: String,
      default: ''
    },
    durationMs: {
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

const RenderJob = mongoose.model('RenderJob', renderJobSchema);

module.exports = RenderJob;

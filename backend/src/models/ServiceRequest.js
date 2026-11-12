const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true
    },
    serviceType: {
      type: String,
      enum: ['CGI_RENDERING', 'VIRTUAL_STAGING', 'VIRTUAL_WALKTHROUGH'],
      required: [true, 'Service type is required']
    },
    requirements: {
      viewTypes: [{ type: String }], // interior, exterior, aerial, etc.
      dayNight: { type: String, enum: ['DAY', 'NIGHT', 'DUSK', 'ANY'], default: 'DAY' },
      roomTypes: [{ type: String }], // for virtual staging
      furnitureStyle: { type: String, default: '' }, // modern, minimalist, luxury, etc.
      colorPalette: { type: String, default: '' },
      walkthroughType: { type: String, enum: ['VIDEO', 'PANORAMA_360', 'INTERACTIVE_3D', ''], default: '' },
      notes: { type: String, default: '' }
    },
    stylePreferences: {
      references: [{ type: String }],
      notes: { type: String, default: '' }
    },
    outputSpecifications: {
      resolution: { type: String, default: '4K' },
      formats: [{ type: String }], // jpg, png, mp4, etc.
      aspectRatio: { type: String, default: '16:9' }
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING'
    }
  },
  {
    timestamps: true
  }
);

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest;

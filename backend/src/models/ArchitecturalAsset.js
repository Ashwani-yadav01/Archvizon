const mongoose = require('mongoose');

const architecturalAssetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['ARCHITECTURAL', 'FURNITURE', 'LIGHTING', 'DECOR', 'MATERIAL'],
      required: true,
      index: true
    },
    subCategory: {
      type: String,
      default: 'GENERAL',
      index: true
    },
    thumbnailUrl: {
      type: String,
      default: ''
    },
    modelUrl: {
      type: String,
      default: ''
    },
    defaultDimensions: {
      width: { type: Number, default: 1 },
      height: { type: Number, default: 1 },
      depth: { type: Number, default: 1 }
    },
    defaultMaterial: {
      color: { type: String, default: '#94a3b8' },
      roughness: { type: Number, default: 0.5 },
      metalness: { type: Number, default: 0.1 },
      textureType: { type: String, default: 'DEFAULT' }
    },
    tags: [String],
    isPreset: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

const ArchitecturalAsset = mongoose.model('ArchitecturalAsset', architecturalAssetSchema);

module.exports = ArchitecturalAsset;

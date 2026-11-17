const mongoose = require('mongoose');

const objectItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      default: 'PRIMITIVE_CUBE'
    },
    name: { type: String, required: true },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    },
    rotation: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    },
    scale: {
      x: { type: Number, default: 1 },
      y: { type: Number, default: 1 },
      z: { type: Number, default: 1 }
    },
    geometry: {
      type: { type: String, default: 'BOX' },
      parameters: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    material: {
      color: { type: String, default: '#94a3b8' },
      roughness: { type: Number, default: 0.6 },
      metalness: { type: Number, default: 0.1 },
      wireframe: { type: Boolean, default: false },
      opacity: { type: Number, default: 1 },
      textureUrl: { type: String, default: '' },
      textureType: { type: String, default: 'DEFAULT' }
    },
    visible: { type: Boolean, default: true },
    locked: { type: Boolean, default: false },
    parentId: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

const sceneSchema = new mongoose.Schema(
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
    name: {
      type: String,
      default: 'Main 3D Scene'
    },
    version: {
      type: Number,
      default: 1
    },
    environment: {
      backgroundColor: { type: String, default: '#090d16' },
      sunIntensity: { type: Number, default: 1.2 },
      ambientLight: {
        color: { type: String, default: '#ffffff' },
        intensity: { type: Number, default: 0.7 }
      },
      directionalLight: {
        color: { type: String, default: '#ffffff' },
        intensity: { type: Number, default: 1.2 },
        position: { type: [Number], default: [12, 20, 12] }
      },
      grid: {
        visible: { type: Boolean, default: true },
        size: { type: Number, default: 30 },
        divisions: { type: Number, default: 30 },
        snap: { type: Number, default: 0.5 }
      }
    },
    camera: {
      position: { type: [Number], default: [9, 7, 9] },
      target: { type: [Number], default: [0, 1, 0] },
      fov: { type: Number, default: 55 }
    },
    objects: [objectItemSchema]
  },
  {
    timestamps: true
  }
);

const Scene = mongoose.model('Scene', sceneSchema);

module.exports = Scene;

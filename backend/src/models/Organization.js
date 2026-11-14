const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [150, 'Name cannot exceed 150 characters']
    },
    organizationType: {
      type: String,
      enum: ['DEVELOPER', 'ARCHITECTURAL_FIRM', 'INTERIOR_STUDIO', 'MARKETING_AGENCY', 'OTHER'],
      default: 'DEVELOPER'
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid contact email']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      country: { type: String, default: '' }
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true
    },
    memberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    settings: {
      defaultDeadlineDays: { type: Number, default: 14 },
      notifyAllMembers: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

// Indexes
organizationSchema.index({ memberIds: 1 });

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;

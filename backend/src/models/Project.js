const mongoose = require('mongoose');
const { PROJECT_STATUSES, ALL_STATUSES } = require('../constants/projectStatuses');

const projectSchema = new mongoose.Schema(
  {
    projectCode: {
      type: String,
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [150, 'Project name cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    propertyType: {
      type: String,
      enum: ['RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE', 'HOSPITALITY', 'INDUSTRIAL', 'OTHER'],
      default: 'RESIDENTIAL'
    },
    location: {
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      country: { type: String, default: '' }
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client ID is required'],
      index: true
    },
    status: {
      type: String,
      enum: ALL_STATUSES,
      default: PROJECT_STATUSES.DRAFT,
      index: true
    },
    deadline: {
      type: Date
    },
    metadata: {
      type: Map,
      of: String
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate project code before saving if not present
projectSchema.pre('save', async function (next) {
  if (!this.projectCode) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.projectCode = `AV-${timestamp}-${random}`;
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

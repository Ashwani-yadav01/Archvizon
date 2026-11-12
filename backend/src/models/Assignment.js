const mongoose = require('mongoose');
const { ROLES } = require('../constants/roles');

const assignmentSchema = new mongoose.Schema(
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
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned user ID is required'],
      index: true
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigner user ID is required']
    },
    roleOnProject: {
      type: String,
      enum: [ROLES.PROJECT_MANAGER, ROLES.VISUALIZATION_ARTIST],
      required: true
    },
    notes: {
      type: String,
      default: ''
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;

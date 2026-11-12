const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true
    },
    deliverableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deliverable',
      index: true
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required']
    },
    message: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

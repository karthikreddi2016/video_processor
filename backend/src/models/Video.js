const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  originalFilename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size must be positive']
  },
  mimeType: {
    type:  String,
    required: [true, 'MIME type is required'],
    enum: {
      values: ['video/mp4', 'video/quicktime', 'video/webm'],
      message: 'Invalid video format.  Supported:  MP4, MOV, WebM'
    }
  },
  duration: {
    type: Number,
    default: null,
    min: [0, 'Duration must be positive']
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for tasks
videoSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'videoId'
});

// Index for faster queries
videoSchema.index({ uploadedAt: -1 });

// Instance method to get file extension
videoSchema.methods.getFileExtension = function() {
  const mimeMap = {
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/webm': 'webm'
  };
  return mimeMap[this.mimeType] || 'mp4';
};

module.exports = mongoose.model('Video', videoSchema);
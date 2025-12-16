const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types. ObjectId,
    ref: 'Video',
    required: [true, 'Video ID is required'],
    index: true
  },
  outputFormat: {
    type: String,
    required: [true, 'Output format is required'],
    enum: {
      values: ['V1', 'V2'],
      message: 'Output format must be V1 or V2'
    }
  },
  resolutionProfile: {
    type: String,
    required: [true, 'Resolution profile is required'],
    enum: {
      values: ['P1', 'P2', 'P3'],
      message: 'Resolution profile must be P1, P2, or P3'
    }
  },
  state: {
    type: String,
    required: true,
    enum: {
      values: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'],
      message: 'Invalid task state'
    },
    default: 'QUEUED',
    index: true
  },
  outputFilePath: {
    type: String,
    default: null
  },
  errorMessage: {
    type: String,
    default: null
  },
  errorStack: {
    type: String,
    default: null
  },
  queuedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  processingAt: {
    type: Date,
    default: null
  },
  completedAt:  {
    type: Date,
    default: null
  },
  failedAt: {
    type:  Date,
    default: null
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Compound index for unique task variant per video
taskSchema.index({ videoId: 1, outputFormat: 1, resolutionProfile: 1 }, { unique: true });

// Index for querying active tasks
taskSchema.index({ state: 1, queuedAt: 1 });

// Instance method to check if task is active
taskSchema. methods.isActive = function() {
  return this.state === 'QUEUED' || this.state === 'PROCESSING';
};

// Instance method to get variant label
taskSchema.methods.getVariantLabel = function() {
  const profiles = {
    P1: '480p',
    P2: '720p',
    P3: '1080p'
  };
  const formats = {
    V1: 'MP4/H.264',
    V2: 'WebM/VP9'
  };
  return `${formats[this.outputFormat]} @ ${profiles[this.resolutionProfile]}`;
};

module.exports = mongoose.model('Task', taskSchema);
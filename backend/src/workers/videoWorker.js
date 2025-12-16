require('dotenv').config();
const connectDB = require('../config/database');
const queueService = require('../services/queueService');
const taskService = require('../services/taskService');
const videoService = require('../services/videoService');
const videoProcessor = require('../processors/videoProcessor');

// Connect to MongoDB
connectDB();

const queue = queueService.getQueue();

console.log('🔧 Video Processing Worker Started');
console.log(`📊 Environment: ${process.env.NODE_ENV}`);
console.log(`🔄 Concurrency: 2 jobs at a time`);

/**
 * Process video processing jobs
 */
queue.process(2, async (job) => {
  const { taskId, videoId, format, profile } = job.data;

  console.log(`\n🎬 Starting job ${job.id} for task ${taskId}`);
  console.log(`   Format: ${format}, Profile: ${profile}`);

  try {
    // Update task state to PROCESSING
    await taskService.updateTaskState(taskId, 'PROCESSING', {
      processingAt: new Date()
    });

    // Get video details
    const video = await videoService.getVideoById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    console.log(`   Video: ${video.originalFilename}`);

    // Process video with FFmpeg
    const outputPath = await videoProcessor.processVideo(
      video.filePath,
      format,
      profile,
      async (progress) => {
        // Update job progress
        job.progress(progress);

        // Update task progress in database every 5%
        if (progress % 5 === 0) {
          await taskService.updateProgress(taskId, progress);
        }
      }
    );

    // Update task state to COMPLETED
    await taskService.updateTaskState(taskId, 'COMPLETED', {
      completedAt: new Date(),
      outputFilePath:  outputPath,
      progress: 100
    });

    console.log(`✅ Job ${job.id} completed successfully`);
    return { success: true, outputPath };

  } catch (error) {
    console.error(`❌ Job ${job.id} failed:`, error.message);

    // Update task state to FAILED
    await taskService.updateTaskState(taskId, 'FAILED', {
      failedAt: new Date(),
      errorMessage: error.message,
      errorStack: error.stack
    });

    throw error;
  }
});

/**
 * Queue event handlers
 */
queue.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed`);
});

queue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:  ${err.message}`);
});

queue.on('stalled', (job) => {
  console.warn(`⚠️  Job ${job.id} stalled`);
});

queue.on('active', (job) => {
  console.log(`🔄 Job ${job.id} is now active`);
});

queue.on('error', (error) => {
  console.error('❌ Queue error:', error);
});

/**
 * Graceful shutdown
 */
const shutdown = async () => {
  console.log('\n⏳ Shutting down worker...');
  
  await queue.close();
  console.log('✅ Queue closed');
  
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
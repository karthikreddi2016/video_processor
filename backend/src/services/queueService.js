const Queue = require('bull');
const redisConfig = require('../config/redis');

// Create queue instance
const videoProcessingQueue = new Queue('video-processing', {
  redis:  redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: false     // Keep failed jobs for debugging
  }
});

class QueueService {
  /**
   * Add a video processing job to the queue
   */
  async addProcessingJob(taskData) {
    try {
      const job = await videoProcessingQueue.add(taskData, {
        jobId: taskData. taskId. toString(), // Use task ID as job ID
        priority: this.getPriority(taskData.resolutionProfile)
      });

      console.log(`📋 Job added to queue: ${job.id}`);
      return job;
    } catch (error) {
      console.error('Error adding job to queue:', error);
      throw error;
    }
  }

  /**
   * Add multiple jobs at once
   */
  async addMultipleJobs(tasksData) {
    try {
      const jobs = await Promise.all(
        tasksData.map(taskData => this.addProcessingJob(taskData))
      );
      console.log(`📋 Added ${jobs.length} jobs to queue`);
      return jobs;
    } catch (error) {
      console.error('Error adding multiple jobs:', error);
      throw error;
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId) {
    try {
      const job = await videoProcessingQueue.getJob(jobId);
      if (!job) {
        return null;
      }

      const state = await job.getState();
      const progress = job.progress();

      return {
        jobId: job.id,
        state,
        progress,
        data: job.data,
        failedReason: job.failedReason,
        finishedOn: job.finishedOn,
        processedOn: job.processedOn
      };
    } catch (error) {
      console.error('Error getting job status:', error);
      throw error;
    }
  }

  /**
   * Get queue instance
   */
  getQueue() {
    return videoProcessingQueue;
  }

  /**
   * Get queue stats
   */
  async getQueueStats() {
    try {
      const [waiting, active, completed, failed] = await Promise.all([
        videoProcessingQueue.getWaitingCount(),
        videoProcessingQueue.getActiveCount(),
        videoProcessingQueue.getCompletedCount(),
        videoProcessingQueue.getFailedCount()
      ]);

      return {
        waiting,
        active,
        completed,
        failed,
        total: waiting + active + completed + failed
      };
    } catch (error) {
      console.error('Error getting queue stats:', error);
      throw error;
    }
  }

  /**
   * Get priority based on resolution profile
   */
  getPriority(profile) {
    const priorities = {
      P1: 1, // Highest priority for smallest resolution
      P2: 2,
      P3: 3
    };
    return priorities[profile] || 2;
  }

  /**
   * Clean old jobs
   */
  async cleanQueue() {
    try {
      await videoProcessingQueue.clean(24 * 3600 * 1000); // Clean jobs older than 24 hours
      console.log('🧹 Queue cleaned');
    } catch (error) {
      console.error('Error cleaning queue:', error);
      throw error;
    }
  }
}

module.exports = new QueueService();
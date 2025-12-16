const Video = require('../models/Video');
const Task = require('../models/Task');

class VideoService {
  /**
   * Create a new video record
   */
  async createVideo(videoData) {
    try {
      const video = new Video(videoData);
      await video.save();
      console.log(`✅ Video created:  ${video._id}`);
      return video;
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  }

  /**
   * Get video by ID
   */
  async getVideoById(videoId) {
    try {
      const video = await Video.findById(videoId);
      return video;
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  }

  /**
   * Get all videos with their tasks using aggregation
   */
  async getAllVideos() {
    try {
      const videos = await Video. aggregate([
        {
          $lookup: {
            from: 'tasks',
            localField:  '_id',
            foreignField:  'videoId',
            as: 'tasks'
          }
        },
        {
          $sort: { uploadedAt: -1 }
        },
        {
          $project:  {
            _id: 1,
            originalFilename: 1,
            fileSize: 1,
            mimeType: 1,
            duration: 1,
            uploadedAt: 1,
            createdAt: 1,
            tasks: {
              _id: 1,
              outputFormat: 1,
              resolutionProfile: 1,
              state: 1,
              progress: 1,
              queuedAt: 1,
              processingAt: 1,
              completedAt: 1,
              failedAt: 1,
              errorMessage: 1
            }
          }
        }
      ]);

      return videos;
    } catch (error) {
      console.error('Error fetching all videos:', error);
      throw error;
    }
  }

  /**
   * Get video with all its tasks
   */
  async getVideoWithTasks(videoId) {
    try {
      const video = await Video.findById(videoId).lean();
      if (!video) {
        return null;
      }

      const tasks = await Task.find({ videoId }).sort({ createdAt: -1 }).lean();
      
      return {
        ...video,
        tasks
      };
    } catch (error) {
      console.error('Error fetching video with tasks:', error);
      throw error;
    }
  }

  /**
   * Delete video and all associated tasks
   */
  async deleteVideo(videoId) {
    try {
      // Delete all tasks first
      await Task.deleteMany({ videoId });
      
      // Delete video
      const result = await Video.findByIdAndDelete(videoId);
      
      console.log(`🗑️  Video deleted: ${videoId}`);
      return result;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }
}

module.exports = new VideoService();
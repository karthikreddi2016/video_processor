const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const videoService = require('../services/videoService');
const taskService = require('../services/taskService');
const queueService = require('../services/queueService');
const { validate, validations } = require('../middleware/validation');

/**
 * POST /api/videos/upload
 * Upload a new video file
 */
router.post('/upload', upload.single('video'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const videoData = {
      originalFilename: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    };

    const video = await videoService.createVideo(videoData);

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        videoId: video._id,
        filename: video.originalFilename,
        fileSize: video.fileSize,
        uploadedAt: video.uploadedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/videos
 * Get all videos with their tasks
 */
router.get('/', async (req, res, next) => {
  try {
    const videos = await videoService. getAllVideos();

    res.json({
      success: true,
      count: videos.length,
      data: { videos }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/videos/:videoId
 * Get a specific video with all its tasks
 */
router. get('/:videoId', validate(validations.videoId), async (req, res, next) => {
  try {
    const video = await videoService.getVideoWithTasks(req.params.videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/videos/:videoId/tasks
 * Create processing tasks for a video
 */
router.post(
  '/:videoId/tasks',
  validate([... validations.videoId, ...validations.createTasks]),
  async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const { variants } = req.body;

      // Verify video exists
      const video = await videoService.getVideoById(videoId);
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      // Create task documents
      const tasksData = variants.map(variant => ({
        videoId,
        outputFormat: variant.format,
        resolutionProfile: variant.profile,
        state: 'QUEUED',
        queuedAt: new Date()
      }));

      const tasks = await taskService.createMultipleTasks(tasksData);

      // Add jobs to queue
      const jobsData = tasks.map(task => ({
        taskId: task._id. toString(),
        videoId: task.videoId.toString(),
        format: task.outputFormat,
        profile: task.resolutionProfile
      }));

      await queueService.addMultipleJobs(jobsData);

      res.status(201).json({
        success: true,
        message: `${tasks.length} task(s) created and queued`,
        data: {
          tasks: tasks.map(task => ({
            taskId: task._id,
            format: task.outputFormat,
            profile: task.resolutionProfile,
            state: task.state,
            queuedAt: task.queuedAt
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
/**
 * DELETE /api/videos/:videoId
 * Delete a video and all its tasks
 */
router.delete('/:videoId', validate(validations.videoId), async (req, res, next) => {
  try {
    const { videoId } = req.params;

    const video = await videoService.getVideoById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Delete video (this also deletes associated tasks via the service)
    await videoService.deleteVideo(videoId);

    res.json({
      success: true,
      message: 'Video and all associated tasks deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const taskService = require('../services/taskService');
const queueService = require('../services/queueService');
const { validate, validations } = require('../middleware/validation');
const Task = require('../models/Task');

/**
 * GET /api/tasks/: taskId
 * Get task details
 */
router.get('/:taskId', validate(validations.taskId), async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await taskService.getTaskById(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tasks/: taskId/status
 * Get task status
 */
router.get('/:taskId/status', validate(validations.taskId), async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await taskService.getTaskById(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: {
        state: task.state,
        progress: task.progress,
        errorMessage: task.errorMessage
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tasks/: taskId/download
 * Download processed video
 */
router.get('/:taskId/download', validate(validations.taskId), async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await taskService.getTaskById(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.state !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Task is not completed yet'
      });
    }

    if (! task.outputPath) {
      return res. status(404).json({
        success: false,
        message: 'Output file not found'
      });
    }

    const filePath = path.resolve(task. outputPath);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res. status(404).json({
        success: false,
        message:  'Output file not found on disk'
      });
    }

    // Set headers for download
    const fileName = path.basename(filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'video/mp4');

    // Stream the file
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/tasks/:taskId
 * Delete a task
 */
router.delete('/:taskId', validate(validations.taskId), async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Delete output file if it exists
    if (task.outputPath) {
      try {
        const filePath = path.resolve(task.outputPath);
        await fs.unlink(filePath);
        console.log(`🗑️ Deleted file: ${filePath}`);
      } catch (error) {
        console.warn(`⚠️ Could not delete file: ${task.outputPath}`, error.message);
      }
    }

    // Remove job from queue if it's queued or processing
    if (task.state === 'QUEUED' || task.state === 'PROCESSING') {
      try {
        const job = await queueService.videoQueue.getJob(task.jobId);
        if (job) {
          await job.remove();
          console.log(`🗑️ Removed job from queue: ${task.jobId}`);
        }
      } catch (error) {
        console.warn(`⚠️ Could not remove job from queue: ${task.jobId}`, error.message);
      }
    }

    // Delete the task from database
    await Task.findByIdAndDelete(taskId);
    console.log(`🗑️ Task deleted: ${taskId}`);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
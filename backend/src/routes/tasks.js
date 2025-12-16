const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const taskService = require('../services/taskService');
const queueService = require('../services/queueService');
const { validate, validations } = require('../middleware/validation');

/**
 * GET /api/tasks/: taskId
 * Get task details
 */
router.get('/:taskId', validate(validations.taskId), async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tasks/: taskId/status
 * Get lightweight task status
 */
router.get('/:taskId/status', validate(validations.taskId), async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: {
        taskId: task._id,
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
 * GET /api/tasks/:taskId/download
 * Download processed video
 */
router.get('/:taskId/download', validate(validations.taskId), async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.state !== 'COMPLETED') {
      return res. status(400).json({
        success: false,
        message:  `Task is not completed. Current state: ${task.state}`
      });
    }

    if (!task.outputFilePath) {
      return res.status(404).json({
        success: false,
        message: 'Output file not found'
      });
    }

    // Check if file exists
    try {
      await fs.access(task.outputFilePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Output file not found on server'
      });
    }

    // Stream the file
    const filename = path.basename(task.outputFilePath);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    const fileStream = require('fs').createReadStream(task.outputFilePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tasks/active
 * Get all active tasks
 */
router. get('/', async (req, res, next) => {
  try {
    const tasks = await taskService.getActiveTasks();

    res.json({
      success: true,
      count: tasks.length,
      data: { tasks }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
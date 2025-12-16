const Task = require('../models/Task');

class TaskService {
  /**
   * Create a single task
   */
  async createTask(taskData) {
    try {
      const task = new Task(taskData);
      await task.save();
      console.log(`✅ Task created: ${task._id} (${task.outputFormat}-${task.resolutionProfile})`);
      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Create multiple tasks at once
   */
  async createMultipleTasks(tasksData) {
    try {
      const tasks = await Task.insertMany(tasksData, { ordered: false });
      console.log(`✅ Created ${tasks.length} tasks`);
      return tasks;
    } catch (error) {
      // Handle duplicate key errors gracefully
      if (error.code === 11000) {
        const inserted = error.insertedDocs || [];
        console.log(`⚠️  Created ${inserted.length} tasks (some duplicates skipped)`);
        return inserted;
      }
      console.error('Error creating multiple tasks:', error);
      throw error;
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId) {
    try {
      const task = await Task.findById(taskId).populate('videoId');
      return task;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  /**
   * Update task state with timestamps
   */
  async updateTaskState(taskId, state, additionalData = {}) {
    try {
      const updateData = { state, ...additionalData };

      // Add appropriate timestamp based on state
      const now = new Date();
      switch (state) {
        case 'PROCESSING':
          updateData.processingAt = now;
          break;
        case 'COMPLETED': 
          updateData.completedAt = now;
          updateData.progress = 100;
          break;
        case 'FAILED': 
          updateData.failedAt = now;
          break;
      }

      const task = await Task.findByIdAndUpdate(
        taskId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (task) {
        console.log(`📝 Task ${taskId} updated: ${state}`);
      }

      return task;
    } catch (error) {
      console.error('Error updating task state:', error);
      throw error;
    }
  }

  /**
   * Get all tasks for a video
   */
  async getTasksByVideoId(videoId) {
    try {
      const tasks = await Task.find({ videoId }).sort({ createdAt: -1 });
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks for video:', error);
      throw error;
    }
  }

  /**
   * Get all active tasks (QUEUED or PROCESSING)
   */
  async getActiveTasks() {
    try {
      const tasks = await Task. find({
        state: { $in:  ['QUEUED', 'PROCESSING'] }
      }).populate('videoId');
      return tasks;
    } catch (error) {
      console.error('Error fetching active tasks:', error);
      throw error;
    }
  }

  /**
   * Update task progress
   */
  async updateProgress(taskId, progress) {
    try {
      const task = await Task.findByIdAndUpdate(
        taskId,
        { $set: { progress:  Math.min(100, Math.max(0, progress)) } },
        { new: true }
      );
      return task;
    } catch (error) {
      console.error('Error updating task progress:', error);
      throw error;
    }
  }
}

module.exports = new TaskService();
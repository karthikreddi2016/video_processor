const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  /**
   * Upload a video file
   */
  async uploadVideo(file) {
    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch(`${API_BASE_URL}/api/videos/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  /**
   * Create processing tasks for a video
   */
  async createTasks(videoId, variants) {
    const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ variants })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Task creation failed');
    }

    return response.json();
  }

  /**
   * Get all videos
   */
  async getVideos() {
    const response = await fetch(`${API_BASE_URL}/api/videos`);

    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }

    return response.json();
  }

  /**
   * Get a specific video with tasks
   */
  async getVideo(videoId) {
    const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch video');
    }

    return response.json();
  }

  /**
   * Get task status
   */
  async getTaskStatus(taskId) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/status`);

    if (!response.ok) {
      throw new Error('Failed to fetch task status');
    }

    return response.json();
  }

  /**
   * Get download URL for a task
   */
  getDownloadUrl(taskId) {
    return `${API_BASE_URL}/api/tasks/${taskId}/download`;
  }
}

export default new ApiClient();

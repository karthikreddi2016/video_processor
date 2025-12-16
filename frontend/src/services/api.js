const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

class ApiClient {
  async uploadVideo(file) {
    const formData = new FormData()
    formData.append('video', file)

    const response = await fetch(`${API_BASE_URL}/api/videos/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Upload failed')
    }

    return response.json()
  }

  async createTasks(videoId, variants) {
    const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ variants })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error. message || 'Task creation failed')
    }

    return response.json()
  }

  async getVideos() {
    const response = await fetch(`${API_BASE_URL}/api/videos`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch videos')
    }

    return response. json()
  }

  async getVideo(videoId) {
    const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch video')
    }

    return response. json()
  }

  async getTaskStatus(taskId) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/status`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch task status')
    }

    return response.json()
  }

  async deleteVideo(videoId) {
    const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Delete failed')
    }

    return response.json()
  }

  async deleteTask(taskId) {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Delete failed')
    }

    return response.json()
  }

  getDownloadUrl(taskId) {
    return `${API_BASE_URL}/api/tasks/${taskId}/download`
  }
}

export default new ApiClient()
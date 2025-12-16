import { useState } from 'react'
import api from '../services/api'

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const uploadVideo = async (file) => {
    try {
      setUploading(true)
      setProgress(0)
      setError(null)

      // Simulate progress (real implementation would use XMLHttpRequest)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await api.uploadVideo(file)
      
      clearInterval(progressInterval)
      setProgress(100)

      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  return {
    uploadVideo,
    uploading,
    progress,
    error
  }
}
import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useVideos() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.getVideos()
      setVideos(response. data. videos)
      setError(null)
    } catch (err) {
      console.error('Error fetching videos:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  return {
    videos,
    loading,
    error,
    refetch: fetchVideos
  }
}
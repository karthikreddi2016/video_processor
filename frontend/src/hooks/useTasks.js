import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useTasks(videoId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (!videoId) return

    try {
      const response = await api.getVideo(videoId)
      setTasks(response.data.tasks || [])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setLoading(false)
    }
  }, [videoId])

  useEffect(() => {
    fetchTasks()

    // Poll for updates if there are active tasks
    const interval = setInterval(() => {
      const hasActiveTasks = tasks.some(t => 
        t.state === 'QUEUED' || t.state === 'PROCESSING'
      )

      if (hasActiveTasks) {
        fetchTasks()
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [videoId, tasks, fetchTasks])

  return {
    tasks,
    loading,
    refetch: fetchTasks
  }
}
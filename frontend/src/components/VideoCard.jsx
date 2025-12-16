import { useState } from 'react'
import TaskCreator from './TaskCreator'
import TaskList from './TaskList'
import api from '../services/api'
import './VideoCard.css'

function VideoCard({ video, onTaskCreated, onVideoDeleted }) {
  const [showTaskCreator, setShowTaskCreator] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const handleTaskCreated = () => {
    setShowTaskCreator(false)
    if (onTaskCreated) {
      onTaskCreated()
    }
  }

  const handleDelete = async () => {
    if (! window.confirm(`Are you sure you want to delete "${video.originalFilename}"? This will delete all associated tasks.`)) {
      return
    }

    try {
      setDeleting(true)
      await api.deleteVideo(video._id)
      if (onVideoDeleted) {
        onVideoDeleted()
      }
    } catch (error) {
      alert(`Failed to delete video: ${error.message}`)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="video-card">
      <div className="video-header">
        <div className="video-info">
          <h3 className="video-title">📹 {video.originalFilename}</h3>
          <div className="video-meta">
            <span className="meta-item">
              💾 {formatFileSize(video. fileSize)}
            </span>
            <span className="meta-item">
              🕐 {formatDate(video.uploadedAt)}
            </span>
          </div>
        </div>
        <div className="video-actions">
          <button
            onClick={() => setShowTaskCreator(! showTaskCreator)}
            className="create-task-button"
          >
            {showTaskCreator ? '✕ Cancel' : '➕ Create Tasks'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="delete-video-button"
          >
            {deleting ? '🔄 Deleting...' :  '🗑️ Delete'}
          </button>
        </div>
      </div>

      {showTaskCreator && (
        <div className="task-creator-container">
          <TaskCreator 
            videoId={video._id} 
            onTaskCreated={handleTaskCreated}
          />
        </div>
      )}

      <TaskList tasks={video.tasks || []} onTaskDeleted={onTaskCreated} />
    </div>
  )
}

export default VideoCard
import api from '../services/api'
import './TaskCard.css'

const STATE_COLORS = {
  QUEUED: { bg: '#f8f9fa', text: '#6c757d', border: '#dee2e6' },
  PROCESSING: { bg: '#cfe2ff', text: '#084298', border: '#9ec5fe' },
  COMPLETED:  { bg: '#d1e7dd', text: '#0a3622', border: '#a3cfbb' },
  FAILED:  { bg: '#f8d7da', text: '#58151c', border: '#f1aeb5' }
}

const STATE_ICONS = {
  QUEUED:  '⏳',
  PROCESSING:  '⚙️',
  COMPLETED:  '✅',
  FAILED: '❌'
}

function TaskCard({ task }) {
  const stateStyle = STATE_COLORS[task. state] || STATE_COLORS.QUEUED

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getVariantLabel = () => {
    const formats = {
      V1: 'MP4/H.264',
      V2: 'WebM/VP9'
    }
    const profiles = {
      P1: '480p',
      P2: '720p',
      P3: '1080p'
    }
    return `${formats[task.outputFormat]} @ ${profiles[task.resolutionProfile]}`
  }

  return (
    <div className="task-card" style={{ borderLeftColor: stateStyle.border }}>
      <div className="task-header">
        <div className="task-variant">
          <span className="variant-icon">🎬</span>
          <span className="variant-text">{getVariantLabel()}</span>
        </div>
        <div 
          className="task-state-badge"
          style={{
            backgroundColor: stateStyle. bg,
            color: stateStyle.text,
            borderColor: stateStyle.border
          }}
        >
          <span className="state-icon">{STATE_ICONS[task.state]}</span>
          <span className="state-text">{task.state}</span>
        </div>
      </div>

      {task.state === 'PROCESSING' && (
        <div className="task-progress">
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${task.progress || 0}%` }}
            />
          </div>
          <div className="progress-text">{task.progress || 0}%</div>
        </div>
      )}

      {task.state === 'PROCESSING' && task.processingAt && (
        <div className="task-info">
          ⏱️ Processing since {formatDate(task.processingAt)}
        </div>
      )}

      {task.state === 'COMPLETED' && (
        <>
          <div className="task-info">
            ✓ Completed at {formatDate(task.completedAt)}
          </div>
          <a
            href={api.getDownloadUrl(task._id)}
            download
            className="download-button"
          >
            ⬇️ Download
          </a>
        </>
      )}

      {task.state === 'FAILED' && task.errorMessage && (
        <div className="task-error">
          <strong>Error:</strong> {task. errorMessage}
        </div>
      )}

      <div className="task-footer">
        <span className="task-timestamp">
          Created: {formatDate(task.queuedAt)}
        </span>
      </div>
    </div>
  )
}

export default TaskCard
import { useState } from 'react'
import api from '../services/api'
import './TaskCreator.css'

const FORMATS = [
  { value: 'V1', label: 'V1 (MP4/H.264)' },
  { value: 'V2', label: 'V2 (WebM/VP9)' }
]

const PROFILES = [
  { value: 'P1', label: 'P1 (480p @ 1Mbps)' },
  { value: 'P2', label: 'P2 (720p @ 2.5Mbps)' },
  { value: 'P3', label: 'P3 (1080p @ 5Mbps)' }
]

function TaskCreator({ videoId, onTaskCreated }) {
  const [selectedVariants, setSelectedVariants] = useState([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const handleVariantToggle = (format, profile) => {
    const variantKey = `${format}-${profile}`
    const exists = selectedVariants.some(
      v => v.format === format && v.profile === profile
    )

    if (exists) {
      setSelectedVariants(
        selectedVariants.filter(
          v => !(v.format === format && v.profile === profile)
        )
      )
    } else {
      setSelectedVariants([... selectedVariants, { format, profile }])
    }
  }

  const isSelected = (format, profile) => {
    return selectedVariants.some(
      v => v.format === format && v.profile === profile
    )
  }

  const handleCreateTasks = async () => {
    if (selectedVariants.length === 0) {
      setError('Please select at least one variant')
      return
    }

    try {
      setCreating(true)
      setError(null)

      await api.createTasks(videoId, selectedVariants)
      
      if (onTaskCreated) {
        onTaskCreated()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="task-creator">
      <h4 className="creator-title">Select Output Variants</h4>
      
      <div className="variants-grid">
        {FORMATS.map(format => (
          <div key={format.value} className="format-section">
            <div className="format-label">{format.label}</div>
            <div className="profile-buttons">
              {PROFILES.map(profile => (
                <button
                  key={`${format.value}-${profile. value}`}
                  onClick={() => handleVariantToggle(format.value, profile.value)}
                  className={`profile-button ${
                    isSelected(format.value, profile.value) ? 'selected' : ''
                  }`}
                >
                  {profile.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="creator-error">
          ⚠️ {error}
        </div>
      )}

      <div className="creator-footer">
        <div className="selected-count">
          {selectedVariants.length} variant(s) selected
        </div>
        <button
          onClick={handleCreateTasks}
          disabled={creating || selectedVariants. length === 0}
          className="create-button"
        >
          {creating ? 'Creating...' : `Create ${selectedVariants.length} Task(s)`}
        </button>
      </div>
    </div>
  )
}

export default TaskCreator
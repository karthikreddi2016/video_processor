import { useState } from 'react'
import { useUpload } from '../hooks/useUpload'
import './VideoUploader.css'

const MAX_FILE_SIZE = 200 * 1024 * 1024 // 200MB
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']

function VideoUploader({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [validationError, setValidationError] = useState(null)
  const { uploadVideo, uploading, progress, error } = useUpload()

  const validateFile = (file) => {
    if (!file) {
      return 'Please select a file'
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 200MB'
    }

    if (!ALLOWED_TYPES.includes(file. type)) {
      return 'Only MP4, MOV, and WebM files are supported'
    }

    return null
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    setValidationError(null)
    
    if (file) {
      const error = validateFile(file)
      if (error) {
        setValidationError(error)
        setSelectedFile(null)
      } else {
        setSelectedFile(file)
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setValidationError('Please select a file')
      return
    }

    try {
      await uploadVideo(selectedFile)
      setSelectedFile(null)
      if (onUploadSuccess) {
        onUploadSuccess()
      }
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math. log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="uploader">
      <div className="upload-area">
        <input
          type="file"
          id="video-input"
          accept="video/mp4,video/quicktime,video/webm"
          onChange={handleFileSelect}
          disabled={uploading}
          className="file-input"
        />
        <label htmlFor="video-input" className="file-label">
          <div className="upload-icon">📁</div>
          <div className="upload-text">
            {selectedFile ? (
              <>
                <strong>{selectedFile.name}</strong>
                <br />
                <span className="file-size">{formatFileSize(selectedFile.size)}</span>
              </>
            ) : (
              <>
                Click to select a video file
                <br />
                <span className="file-hint">MP4, MOV, or WebM (max 200MB)</span>
              </>
            )}
          </div>
        </label>
      </div>

      {validationError && (
        <div className="validation-error">
          ⚠️ {validationError}
        </div>
      )}

      {error && (
        <div className="upload-error">
          ❌ {error}
        </div>
      )}

      {uploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-text">{progress}% uploaded</div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={! selectedFile || uploading}
        className="upload-button"
      >
        {uploading ? 'Uploading...' : 'Upload Video'}
      </button>
    </div>
  )
}

export default VideoUploader
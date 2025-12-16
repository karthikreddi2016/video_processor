import { useState } from 'react'
import './App.css'
import VideoUploader from './components/VideoUploader'
import VideoList from './components/VideoList'
import { useVideos } from './hooks/useVideos'

function App() {
  const { videos, loading, error, refetch } = useVideos()
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleUploadSuccess = () => {
    setUploadSuccess(true)
    refetch()
    setTimeout(() => setUploadSuccess(false), 3000)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎬 Async Video Processor</h1>
        <p>Upload videos and process them into multiple formats asynchronously</p>
      </header>

      <div className="container">
        {/* Upload Section */}
        <div className="section">
          <h2 className="section-title">Upload Video</h2>
          <VideoUploader onUploadSuccess={handleUploadSuccess} />
          {uploadSuccess && (
            <div style={{ 
              marginTop: '15px', 
              padding: '12px', 
              backgroundColor: '#d4edda', 
              color: '#155724',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              ✅ Video uploaded successfully!
            </div>
          )}
        </div>

        {/* Videos Section */}
        <div className="section">
          <h2 className="section-title">Videos & Tasks</h2>
          {error && <div className="error">Error: {error}</div>}
          {loading ? (
            <div className="loading">Loading videos...</div>
          ) : (
            <VideoList videos={videos} onTaskCreated={refetch} />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
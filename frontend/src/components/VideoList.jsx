import VideoCard from './VideoCard'
import './VideoList.css'

function VideoList({ videos, onTaskCreated }) {
  if (! videos || videos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎥</div>
        <p className="empty-state-text">No videos uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="video-list">
      {videos.map((video) => (
        <VideoCard 
          key={video._id} 
          video={video} 
          onTaskCreated={onTaskCreated}
          onVideoDeleted={onTaskCreated}
        />
      ))}
    </div>
  )
}

export default VideoList
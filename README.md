# 🎬 Async Video Processor

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat&logo=redis&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-Latest-007808?style=flat&logo=ffmpeg&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

A powerful, production-ready asynchronous video processing system built with React, Node.js, MongoDB, and Redis. Upload videos, create multiple processing tasks with different formats and resolutions, and monitor real-time progress with a beautiful gradient UI.

## ✨ Features

- **📤 Video Upload** - Support for MP4, MOV, and WebM formats (up to 200MB)
- **⚡ Asynchronous Processing** - Queue-based processing with Bull and Redis
- **📊 Real-time Progress Tracking** - Monitor processing progress in real-time
- **🎥 Multiple Formats** - Generate MP4/H.264 and WebM/VP9 outputs
- **📐 Multiple Qualities** - Support for 480p, 720p, and 1080p resolutions
- **⬇️ Download Functionality** - Download processed videos directly from the UI
- **🗑️ Delete Management** - Clean up videos and tasks with automatic file cleanup
- **💾 State Persistence** - MongoDB for reliable data storage and recovery
- **🎨 Beautiful Gradient UI** - Modern, animated interface with smooth transitions
- **📱 Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │
│   (Vite + CSS)  │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐      ┌──────────────┐
│  Express API    │◄────►│   MongoDB    │
│   (Node.js)     │      │ (Data Store) │
└────────┬────────┘      └──────────────┘
         │
         │ Bull Queue
         ▼
┌─────────────────┐      ┌──────────────┐
│  Video Worker   │◄────►│    Redis     │
│   (FFmpeg)      │      │ (Queue Store)│
└─────────────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│  Processed      │
│  Video Files    │
└─────────────────┘
```

### How It Works

1. **Upload**: User uploads a video through the React frontend
2. **Store**: Video metadata is saved to MongoDB, file stored on disk
3. **Task Creation**: User selects desired output variants (format + quality combinations)
4. **Queue**: Tasks are added to Bull queue stored in Redis
5. **Processing**: Worker picks up tasks and processes videos using FFmpeg
6. **Progress**: Real-time updates sent back through periodic polling
7. **Download**: Completed videos available for download
8. **Cleanup**: Delete operations remove files, tasks, and queue jobs

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **FFmpeg** (See installation instructions below)
- **Git** ([Download](https://git-scm.com/))

### FFmpeg Installation

#### Windows
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html
```

#### macOS
```bash
# Using Homebrew
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

Verify installation:
```bash
ffmpeg -version
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/karthikreddi2016/video_processor.git
cd video_processor
```

2. **Start MongoDB and Redis with Docker**
```bash
docker-compose up -d
```

This starts:
- MongoDB on `localhost:27017`
- Redis on `localhost:6379`
- Mongo Express (DB UI) on `localhost:8081` (admin/admin123)

3. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env if needed (defaults should work)
```

4. **Setup Frontend**
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env if needed (defaults should work)
```

### Running the Application

You need **3 terminals** to run all components:

**Terminal 1 - API Server:**
```bash
cd backend
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Video Worker:**
```bash
cd backend
npm run worker:dev
# Processes videos from the queue
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Access the Application

- **Frontend UI**: http://localhost:5173
- **API Server**: http://localhost:3000
- **Mongo Express**: http://localhost:8081
- **Health Check**: http://localhost:3000/health

## 📖 User Guide

### 1. Upload Video
- Click **"Choose Video"** button
- Select a video file (MP4, MOV, or WebM, max 200MB)
- Click **"Upload Video"** to upload

### 2. Create Processing Tasks
- After upload, select desired output variants:
  - **V1-P1**: MP4/H.264 @ 480p (1000k bitrate)
  - **V1-P2**: MP4/H.264 @ 720p (2500k bitrate)
  - **V1-P3**: MP4/H.264 @ 1080p (5000k bitrate)
  - **V2-P1**: WebM/VP9 @ 480p (1000k bitrate)
  - **V2-P2**: WebM/VP9 @ 720p (2500k bitrate)
  - **V2-P3**: WebM/VP9 @ 1080p (5000k bitrate)
- Click **"Create Tasks"** to queue processing jobs

### 3. Monitor Progress
- View real-time progress bars for each task
- Task states: QUEUED → PROCESSING → COMPLETED/FAILED
- Progress updates automatically every 2 seconds

### 4. Download Videos
- Click **"Download"** button on completed tasks
- Videos download with descriptive filenames

### 5. Delete Functionality
- **Delete Task**: Remove individual task and its output file
- **Delete Video**: Remove video, all its tasks, and all output files

## 📊 Output Specifications

| Variant | Format | Codec | Resolution | Video Bitrate | Audio Bitrate | Use Case |
|---------|--------|-------|------------|---------------|---------------|----------|
| V1-P1 | MP4 | H.264 | 854x480 | 1000k | 128k | Mobile, Low Bandwidth |
| V1-P2 | MP4 | H.264 | 1280x720 | 2500k | 192k | Standard HD, Web |
| V1-P3 | MP4 | H.264 | 1920x1080 | 5000k | 256k | Full HD, High Quality |
| V2-P1 | WebM | VP9 | 854x480 | 1000k | 128k | Web, Low Bandwidth |
| V2-P2 | WebM | VP9 | 1280x720 | 2500k | 192k | Web HD |
| V2-P3 | WebM | VP9 | 1920x1080 | 5000k | 256k | Web Full HD |

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **CSS3** - Custom gradient styling with animations
- **Axios** - HTTP client for API communication

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Mongoose** - MongoDB ODM
- **Bull** - Redis-based queue system
- **Multer** - File upload handling
- **Fluent-FFmpeg** - Video processing wrapper

### Infrastructure
- **MongoDB 7** - NoSQL database for metadata
- **Redis 7** - In-memory data store for queues
- **Docker** - Containerization for dependencies
- **FFmpeg** - Video processing engine

## 📁 Project Structure

```
video_processor/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # MongoDB connection
│   │   │   └── redis.js         # Redis connection
│   │   ├── middleware/
│   │   │   ├── errorHandler.js  # Error handling
│   │   │   ├── upload.js        # Multer configuration
│   │   │   └── validation.js    # Request validation
│   │   ├── models/
│   │   │   ├── Video.js         # Video schema
│   │   │   └── Task.js          # Task schema
│   │   ├── processors/
│   │   │   └── videoProcessor.js # FFmpeg processing logic
│   │   ├── routes/
│   │   │   ├── videos.js        # Video endpoints
│   │   │   └── tasks.js         # Task endpoints
│   │   ├── services/
│   │   │   ├── videoService.js  # Video business logic
│   │   │   ├── taskService.js   # Task business logic
│   │   │   └── queueService.js  # Queue management
│   │   ├── workers/
│   │   │   └── videoWorker.js   # Queue worker
│   │   ├── app.js               # Express app setup
│   │   └── server.js            # Server entry point
│   ├── uploads/                 # Uploaded videos
│   ├── outputs/                 # Processed videos
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoUploader.jsx
│   │   │   ├── VideoList.jsx
│   │   │   ├── VideoCard.jsx
│   │   │   ├── TaskCreator.jsx
│   │   │   ├── TaskList.jsx
│   │   │   └── TaskCard.jsx
│   │   ├── services/
│   │   │   └── api.js           # API client
│   │   ├── hooks/
│   │   │   └── usePolling.js    # Polling hook
│   │   ├── App.jsx              # Main app component
│   │   ├── App.css              # App styles
│   │   ├── index.css            # Global styles
│   │   └── main.jsx             # Entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── docker-compose.yml           # Docker services
├── LICENSE                      # MIT License
├── README.md                    # This file
└── DESIGN_NOTES.md              # Design documentation
```

## 📡 API Documentation

### Videos API

#### Upload Video
```http
POST /api/videos/upload
Content-Type: multipart/form-data

Body:
- video: <file> (MP4, MOV, or WebM, max 200MB)

Response: 201 Created
{
  "success": true,
  "message": "Video uploaded successfully",
  "data": {
    "videoId": "507f1f77bcf86cd799439011",
    "filename": "sample.mp4",
    "fileSize": 15728640,
    "uploadedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

#### Get All Videos
```http
GET /api/videos

Response: 200 OK
{
  "success": true,
  "count": 2,
  "data": {
    "videos": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "originalFilename": "sample.mp4",
        "fileSize": 15728640,
        "uploadedAt": "2025-01-15T10:30:00.000Z",
        "tasks": [...]
      }
    ]
  }
}
```

#### Create Processing Tasks
```http
POST /api/videos/:videoId/tasks
Content-Type: application/json

Body:
{
  "variants": [
    { "format": "V1", "profile": "P1" },
    { "format": "V1", "profile": "P2" },
    { "format": "V2", "profile": "P1" }
  ]
}

Response: 201 Created
{
  "success": true,
  "message": "3 task(s) created and queued",
  "data": {
    "tasks": [...]
  }
}
```

#### Delete Video
```http
DELETE /api/videos/:videoId

Response: 200 OK
{
  "success": true,
  "message": "Video and all associated tasks deleted successfully"
}
```

### Tasks API

#### Get Task Status
```http
GET /api/tasks/:taskId/status

Response: 200 OK
{
  "success": true,
  "data": {
    "state": "PROCESSING",
    "progress": 45,
    "errorMessage": null
  }
}
```

#### Download Processed Video
```http
GET /api/tasks/:taskId/download

Response: 200 OK (Binary file download)
Content-Type: video/mp4
Content-Disposition: attachment; filename="video_V1_P2_1234567890.mp4"
```

#### Delete Task
```http
DELETE /api/tasks/:taskId

Response: 200 OK
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### Health Check

```http
GET /health

Response: 200 OK
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "development"
}
```

## 🔧 Troubleshooting

### FFmpeg not found
**Error**: `Cannot find ffmpeg`

**Solution**:
1. Install FFmpeg (see installation instructions above)
2. Verify with `ffmpeg -version`
3. Restart terminal and backend server

### MongoDB connection error
**Error**: `MongoServerError: connect ECONNREFUSED`

**Solution**:
```bash
# Check if Docker containers are running
docker-compose ps

# Restart containers
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs mongodb
```

### Redis connection error
**Error**: `Error: Redis connection refused`

**Solution**:
```bash
# Restart Redis container
docker-compose restart redis

# Check if Redis is running
docker-compose logs redis
```

### Port already in use
**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change port in .env
PORT=3001
```

### Worker not processing
**Issue**: Tasks stuck in QUEUED state

**Solution**:
1. Ensure worker is running: `npm run worker:dev`
2. Check worker logs for errors
3. Verify Redis connection
4. Restart worker process

### Upload fails
**Error**: File too large or unsupported format

**Solution**:
- Check file size (max 200MB)
- Verify format (MP4, MOV, WebM only)
- Check disk space in `uploads/` directory

## ⚡ Performance & Scaling

### Current Configuration
- **Concurrent Workers**: 1 (configurable in Bull queue)
- **Max File Size**: 200MB
- **Queue**: Redis-backed for reliability
- **Database**: MongoDB with indexes for fast queries

### Processing Time Estimates
- **480p**: ~30-60 seconds per minute of video
- **720p**: ~60-120 seconds per minute of video
- **1080p**: ~120-240 seconds per minute of video

*Times vary based on CPU, video complexity, and codec*

### Scaling Recommendations
1. **Horizontal Scaling**: Run multiple worker processes
2. **Queue Configuration**: Adjust concurrency in `queueService.js`
3. **Storage**: Use cloud storage (S3, GCS) for production
4. **CDN**: Serve processed videos via CDN
5. **Load Balancer**: Distribute API requests across instances

## 🔒 Security

### Current Implementation
- File type validation (MIME type checking)
- File size limits (200MB max)
- Input sanitization (express-validator)
- CORS configuration for frontend
- Error message sanitization

### Production Recommendations
- [ ] Add authentication (JWT, OAuth)
- [ ] Implement rate limiting
- [ ] Enable HTTPS/SSL
- [ ] Add file scanning (virus/malware)
- [ ] Use signed URLs for downloads
- [ ] Implement user quotas
- [ ] Add audit logging
- [ ] Secure MongoDB and Redis (authentication, network isolation)
- [ ] Environment variable management (secrets manager)

## ✅ Testing Checklist

### Upload Flow
- [ ] Upload MP4 file
- [ ] Upload MOV file
- [ ] Upload WebM file
- [ ] Reject unsupported format
- [ ] Reject file > 200MB
- [ ] Verify metadata saved to MongoDB

### Task Creation
- [ ] Create single variant
- [ ] Create multiple variants
- [ ] Prevent duplicate variants
- [ ] Verify tasks queued

### Processing
- [ ] Worker picks up task
- [ ] Progress updates in real-time
- [ ] Task completes successfully
- [ ] Output file created
- [ ] Handle processing errors

### Download
- [ ] Download completed MP4
- [ ] Download completed WebM
- [ ] Verify file integrity
- [ ] Check filename format

### Delete
- [ ] Delete single task
- [ ] Delete video with all tasks
- [ ] Verify files removed from disk
- [ ] Verify database cleanup

## 👨‍💻 Development

### Available Scripts

**Backend:**
```bash
npm start          # Start API server (production)
npm run dev        # Start API server (development with nodemon)
npm run worker     # Start worker (production)
npm run worker:dev # Start worker (development with nodemon)
```

**Frontend:**
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Environment Variables

**Backend (.env):**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/video_processor
REDIS_URL=redis://localhost:6379
UPLOAD_DIR=./uploads
OUTPUT_DIR=./outputs
MAX_FILE_SIZE=209715200
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Follow existing code style
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**karthikreddi2016**
- GitHub: [@karthikreddi2016](https://github.com/karthikreddi2016)

## 🙏 Acknowledgments

- [FFmpeg](https://ffmpeg.org/) - Powerful video processing
- [Bull](https://github.com/OptimalBits/bull) - Reliable queue system
- [Mongoose](https://mongoosejs.com/) - Elegant MongoDB ODM
- [React](https://react.dev/) - Modern UI library
- [Express](https://expressjs.com/) - Fast web framework

## 🗺️ Future Roadmap

- [ ] **WebSocket Support** - Real-time progress updates without polling
- [ ] **Cloud Storage** - S3/GCS integration for scalable storage
- [ ] **User Authentication** - Multi-user support with JWT
- [ ] **Batch Processing** - Process multiple videos simultaneously
- [ ] **Custom Profiles** - User-defined quality settings
- [ ] **Thumbnail Generation** - Auto-generate video thumbnails
- [ ] **Video Preview** - In-browser video player
- [ ] **Advanced Analytics** - Processing stats and metrics
- [ ] **Email Notifications** - Notify users on completion
- [ ] **API Rate Limiting** - Prevent abuse
- [ ] **Docker Deployment** - Full containerized deployment
- [ ] **Kubernetes Support** - Production-grade orchestration

## 💬 Support

For issues, questions, or contributions:
- Open an [Issue](https://github.com/karthikreddi2016/video_processor/issues)
- Submit a [Pull Request](https://github.com/karthikreddi2016/video_processor/pulls)
- Contact: [GitHub Profile](https://github.com/karthikreddi2016)

---

**Built with ❤️ by karthikreddi2016**

*Happy video processing! 🎬*

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;

// Variant specifications
const VARIANT_SPECS = {
  V1: {
    container: 'mp4',
    videoCodec: 'libx264',
    audioCodec: 'aac',
    extension: 'mp4',
    preset: 'medium'
  },
  V2: {
    container: 'webm',
    videoCodec:  'libvpx-vp9',
    audioCodec: 'libopus',
    extension: 'webm',
    preset: 'medium'
  }
};

// Profile specifications
const PROFILE_SPECS = {
  P1: {
    resolution: '854x480',
    bitrate:  '1000k',
    audioBitrate: '128k',
    label: '480p'
  },
  P2: {
    resolution:  '1280x720',
    bitrate: '2500k',
    audioBitrate: '192k',
    label: '720p'
  },
  P3: {
    resolution: '1920x1080',
    bitrate: '5000k',
    audioBitrate: '256k',
    label: '1080p'
  }
};

class VideoProcessor {
  /**
   * Process a video file
   */
  async processVideo(inputPath, format, profile, onProgress) {
    const variant = VARIANT_SPECS[format];
    const profileSpec = PROFILE_SPECS[profile];

    if (!variant) {
      throw new Error(`Invalid format: ${format}`);
    }
    if (!profileSpec) {
      throw new Error(`Invalid profile: ${profile}`);
    }

    console.log(`🎬 Processing video: ${format}-${profile} (${profileSpec.label})`);

    const outputPath = await this.generateOutputPath(
      inputPath,
      format,
      profile,
      variant. extension
    );

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .videoCodec(variant.videoCodec)
        .audioCodec(variant.audioCodec)
        .size(profileSpec.resolution)
        .videoBitrate(profileSpec.bitrate)
        .audioBitrate(profileSpec.audioBitrate)
        .format(variant.container);

      // Add codec-specific options
      if (format === 'V1') {
        command.outputOptions([
          '-preset', variant.preset,
          '-crf', '23',
          '-movflags', '+faststart'
        ]);
      } else if (format === 'V2') {
        command.outputOptions([
          '-deadline', 'good',
          '-cpu-used', '1',
          '-row-mt', '1'
        ]);
      }

      command
        .on('start', (commandLine) => {
          console.log(`📹 FFmpeg command:  ${commandLine}`);
        })
        .on('progress', (progress) => {
          const percent = Math.round(progress.percent || 0);
          if (onProgress) {
            onProgress(percent);
          }
          if (percent % 10 === 0) {
            console.log(`⏳ Processing: ${percent}%`);
          }
        })
        .on('end', () => {
          console.log(`✅ Processing completed: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err, stdout, stderr) => {
          console.error('❌ FFmpeg error:', err. message);
          console.error('FFmpeg stderr:', stderr);
          reject(new Error(`Video processing failed: ${err.message}`));
        })
        .save(outputPath);
    });
  }

  /**
   * Generate output file path
   */
  async generateOutputPath(inputPath, format, profile, extension) {
    const outputDir = process.env.OUTPUT_DIR || './outputs';
    const basename = path.basename(inputPath, path.extname(inputPath));
    const timestamp = Date.now();
    const filename = `${basename}_${format}_${profile}_${timestamp}.${extension}`;
    return path.join(outputDir, filename);
  }

  /**
   * Get video metadata
   */
  async getVideoMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            duration: metadata.format.duration,
            size: metadata.format.size,
            bitrate: metadata.format.bit_rate,
            format: metadata.format.format_name
          });
        }
      });
    });
  }

  /**
   * Validate video file
   */
  async validateVideo(filePath) {
    try {
      await this.getVideoMetadata(filePath);
      return true;
    } catch (error) {
      console.error('Video validation failed:', error);
      return false;
    }
  }
}

module.exports = new VideoProcessor();
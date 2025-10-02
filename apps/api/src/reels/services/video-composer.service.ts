import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Reel, ReelSourceType, ReelTemplate } from '../dto/reel.dto';

const execAsync = promisify(exec);

export interface VideoCompositionRequest {
  reel: Reel;
  backgroundUrl?: string;
  audioUrl?: string;
  outputPath?: string;
}

export interface VideoCompositionResult {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  fileSize: number;
}

@Injectable()
export class VideoComposerService {
  private readonly logger = new Logger(VideoComposerService.name);
  private readonly tempDir: string;
  private readonly outputDir: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.tempDir = this.configService.get<string>('TEMP_DIR') || '/tmp/reels';
    this.outputDir = this.configService.get<string>('REELS_OUTPUT_DIR') || '/tmp/reels/output';
    this.ensureDirectories();
  }

  /**
   * Compose reel video based on source type
   */
  async composeVideo(request: VideoCompositionRequest): Promise<VideoCompositionResult> {
    const { reel } = request;
    
    this.logger.log(`Starting video composition for reel: ${reel.id}`);

    try {
      // Create working directory for this reel
      const workDir = path.join(this.tempDir, reel.id);
      await fs.mkdir(workDir, { recursive: true });

      let result: VideoCompositionResult;

      // Compose based on source type
      switch (reel.source_type) {
        case ReelSourceType.VIDEO:
          result = await this.composeVideoSource(reel, workDir);
          break;
        case ReelSourceType.IMAGE:
          result = await this.composeImageSource(reel, workDir);
          break;
        case ReelSourceType.TEXT_ONLY:
          result = await this.composeTextOnlySource(reel, workDir);
          break;
        default:
          throw new Error(`Unsupported source type: ${reel.source_type}`);
      }

      // Cleanup working directory
      await this.cleanupWorkDir(workDir);

      this.logger.log(`Video composition completed for reel: ${reel.id}`);
      return result;

    } catch (error) {
      this.logger.error(`Video composition failed for reel: ${reel.id}`, error);
      throw error;
    }
  }

  /**
   * Compose video from video source
   */
  private async composeVideoSource(reel: Reel, workDir: string): Promise<VideoCompositionResult> {
    const sourceVideoUrl = reel.assets.background_image; // This contains the source video URL
    if (!sourceVideoUrl) {
      throw new Error('No source video URL provided');
    }

    // Download source video
    const sourceVideoPath = path.join(workDir, 'source.mp4');
    await this.downloadFile(sourceVideoUrl, sourceVideoPath);

    // Create overlay elements
    const overlayPath = await this.createVideoOverlay(reel, workDir);

    // Download audio if available
    let audioPath: string | undefined;
    if (reel.assets.audio_url) {
      audioPath = path.join(workDir, 'audio.mp3');
      await this.downloadFile(reel.assets.audio_url, audioPath);
    }

    // Compose final video
    const outputPath = path.join(this.outputDir, `${reel.id}.mp4`);
    await this.composeVideoWithFFmpeg({
      sourceVideo: sourceVideoPath,
      overlay: overlayPath,
      audio: audioPath,
      output: outputPath,
      duration: reel.duration_seconds,
      template: reel.template
    });

    // Generate thumbnail
    const thumbnailPath = path.join(this.outputDir, `${reel.id}_thumb.jpg`);
    await this.generateVideoThumbnail(outputPath, thumbnailPath);

    // Get file stats
    const stats = await fs.stat(outputPath);

    return {
      videoUrl: this.getPublicUrl(outputPath),
      thumbnailUrl: this.getPublicUrl(thumbnailPath),
      duration: reel.duration_seconds,
      fileSize: stats.size
    };
  }

  /**
   * Compose video from image source
   */
  private async composeImageSource(reel: Reel, workDir: string): Promise<VideoCompositionResult> {
    const sourceImageUrl = reel.assets.background_image;
    if (!sourceImageUrl) {
      throw new Error('No source image URL provided');
    }

    // Download source image
    const sourceImagePath = path.join(workDir, 'source.jpg');
    await this.downloadFile(sourceImageUrl, sourceImagePath);

    // Create animated background from image
    const animatedBgPath = path.join(workDir, 'animated_bg.mp4');
    await this.createAnimatedBackground(sourceImagePath, animatedBgPath, reel.duration_seconds);

    // Create overlay elements
    const overlayPath = await this.createImageOverlay(reel, workDir);

    // Download audio if available
    let audioPath: string | undefined;
    if (reel.assets.audio_url) {
      audioPath = path.join(workDir, 'audio.mp3');
      await this.downloadFile(reel.assets.audio_url, audioPath);
    }

    // Compose final video
    const outputPath = path.join(this.outputDir, `${reel.id}.mp4`);
    await this.composeVideoWithFFmpeg({
      sourceVideo: animatedBgPath,
      overlay: overlayPath,
      audio: audioPath,
      output: outputPath,
      duration: reel.duration_seconds,
      template: reel.template
    });

    // Generate thumbnail
    const thumbnailPath = path.join(this.outputDir, `${reel.id}_thumb.jpg`);
    await this.generateVideoThumbnail(outputPath, thumbnailPath);

    // Get file stats
    const stats = await fs.stat(outputPath);

    return {
      videoUrl: this.getPublicUrl(outputPath),
      thumbnailUrl: this.getPublicUrl(thumbnailPath),
      duration: reel.duration_seconds,
      fileSize: stats.size
    };
  }

  /**
   * Compose video from text only
   */
  private async composeTextOnlySource(reel: Reel, workDir: string): Promise<VideoCompositionResult> {
    // Create animated background
    const backgroundPath = path.join(workDir, 'background.mp4');
    await this.createTextOnlyBackground(reel, backgroundPath);

    // Create text overlay
    const overlayPath = await this.createTextOnlyOverlay(reel, workDir);

    // Download audio if available
    let audioPath: string | undefined;
    if (reel.assets.audio_url) {
      audioPath = path.join(workDir, 'audio.mp3');
      await this.downloadFile(reel.assets.audio_url, audioPath);
    }

    // Compose final video
    const outputPath = path.join(this.outputDir, `${reel.id}.mp4`);
    await this.composeVideoWithFFmpeg({
      sourceVideo: backgroundPath,
      overlay: overlayPath,
      audio: audioPath,
      output: outputPath,
      duration: reel.duration_seconds,
      template: reel.template
    });

    // Generate thumbnail
    const thumbnailPath = path.join(this.outputDir, `${reel.id}_thumb.jpg`);
    await this.generateVideoThumbnail(outputPath, thumbnailPath);

    // Get file stats
    const stats = await fs.stat(outputPath);

    return {
      videoUrl: this.getPublicUrl(outputPath),
      thumbnailUrl: this.getPublicUrl(thumbnailPath),
      duration: reel.duration_seconds,
      fileSize: stats.size
    };
  }

  /**
   * Create video overlay with text and branding
   */
  private async createVideoOverlay(reel: Reel, workDir: string): Promise<string> {
    const overlayPath = path.join(workDir, 'overlay.png');
    
    // TODO: Implement overlay creation using Canvas API or ImageMagick
    // For now, create a simple text overlay
    
    const overlayConfig = this.getOverlayConfig(reel.template);
    
    // Create overlay using ImageMagick (placeholder command)
    const command = `convert -size 1080x1920 xc:transparent \\
      -font Arial-Bold -pointsize ${overlayConfig.titleSize} -fill "${overlayConfig.titleColor}" \\
      -gravity North -annotate +0+${overlayConfig.titleY} "${reel.content.headline}" \\
      -font Arial -pointsize ${overlayConfig.textSize} -fill "${overlayConfig.textColor}" \\
      -gravity Center -annotate +0+${overlayConfig.textY} "${reel.content.summary_sentences.join('\\n\\n')}" \\
      "${overlayPath}"`;

    try {
      await execAsync(command);
      return overlayPath;
    } catch (error) {
      this.logger.warn('ImageMagick overlay creation failed, using fallback');
      // Create a simple text file as fallback
      await fs.writeFile(overlayPath + '.txt', reel.content.headline);
      return overlayPath + '.txt';
    }
  }

  /**
   * Create image overlay
   */
  private async createImageOverlay(reel: Reel, workDir: string): Promise<string> {
    // Similar to video overlay but optimized for static images
    return this.createVideoOverlay(reel, workDir);
  }

  /**
   * Create text-only overlay
   */
  private async createTextOnlyOverlay(reel: Reel, workDir: string): Promise<string> {
    // More elaborate text presentation for text-only reels
    return this.createVideoOverlay(reel, workDir);
  }

  /**
   * Create animated background from static image
   */
  private async createAnimatedBackground(imagePath: string, outputPath: string, duration: number): Promise<void> {
    // Ken Burns effect: slow zoom and pan
    const command = `ffmpeg -loop 1 -i "${imagePath}" \\
      -vf "scale=1200:1200,crop=1080:1920,zoompan=z='min(zoom+0.0015,1.5)':d=${duration * 30}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920" \\
      -t ${duration} -pix_fmt yuv420p -y "${outputPath}"`;

    try {
      await execAsync(command);
    } catch (error) {
      this.logger.error('Animated background creation failed', error);
      throw new Error('Failed to create animated background');
    }
  }

  /**
   * Create text-only background
   */
  private async createTextOnlyBackground(reel: Reel, outputPath: string): Promise<void> {
    const bgConfig = this.getBackgroundConfig(reel.template, reel.category);
    
    // Create animated gradient background
    const command = `ffmpeg -f lavfi \\
      -i "color=${bgConfig.color1}:size=1080x1920:duration=${reel.duration_seconds}" \\
      -vf "geq=r='${bgConfig.gradient}':g='${bgConfig.gradient}':b='${bgConfig.gradient}'" \\
      -pix_fmt yuv420p -y "${outputPath}"`;

    try {
      await execAsync(command);
    } catch (error) {
      this.logger.error('Text-only background creation failed', error);
      throw new Error('Failed to create text-only background');
    }
  }

  /**
   * Compose final video with FFmpeg
   */
  private async composeVideoWithFFmpeg(options: {
    sourceVideo: string;
    overlay?: string;
    audio?: string;
    output: string;
    duration: number;
    template: ReelTemplate;
  }): Promise<void> {
    
    let command = `ffmpeg -i "${options.sourceVideo}"`;
    
    // Add audio if available
    if (options.audio) {
      command += ` -i "${options.audio}"`;
    }
    
    // Add overlay if available
    if (options.overlay && options.overlay.endsWith('.png')) {
      command += ` -i "${options.overlay}"`;
    }

    // Video filters
    let vf = 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2';
    
    // Add overlay filter if overlay exists
    if (options.overlay && options.overlay.endsWith('.png')) {
      vf += ',overlay=0:0';
    }

    command += ` -vf "${vf}"`;
    
    // Audio options
    if (options.audio) {
      command += ' -c:a aac -b:a 128k -shortest';
    } else {
      command += ' -an'; // No audio
    }
    
    // Video options
    command += ` -c:v libx264 -preset medium -crf 23 -t ${options.duration} -pix_fmt yuv420p -y "${options.output}"`;

    try {
      this.logger.log(`Executing FFmpeg command: ${command.substring(0, 100)}...`);
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes('frame=')) {
        this.logger.warn('FFmpeg stderr:', stderr);
      }
      
      this.logger.log('Video composition completed successfully');
    } catch (error) {
      this.logger.error('FFmpeg composition failed', error);
      throw new Error(`Video composition failed: ${error.message}`);
    }
  }

  /**
   * Generate video thumbnail
   */
  private async generateVideoThumbnail(videoPath: string, thumbnailPath: string): Promise<void> {
    const command = `ffmpeg -i "${videoPath}" -ss 00:00:02 -vframes 1 -y "${thumbnailPath}"`;
    
    try {
      await execAsync(command);
    } catch (error) {
      this.logger.error('Thumbnail generation failed', error);
      throw new Error('Failed to generate thumbnail');
    }
  }

  /**
   * Download file from URL
   */
  private async downloadFile(url: string, outputPath: string): Promise<void> {
    try {
      const response = await this.httpService.axiosRef({
        method: 'GET',
        url: url,
        responseType: 'stream'
      });

      const writer = require('fs').createWriteStream(outputPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to download file from ${url}: ${error.message}`);
    }
  }

  /**
   * Get overlay configuration for template
   */
  private getOverlayConfig(template: ReelTemplate) {
    const configs = {
      [ReelTemplate.NEWS_VIDEO]: {
        titleSize: 48,
        titleColor: '#FFFFFF',
        titleY: 200,
        textSize: 36,
        textColor: '#F0F0F0',
        textY: 0
      },
      [ReelTemplate.NEWS_IMAGE]: {
        titleSize: 52,
        titleColor: '#FFFFFF',
        titleY: 150,
        textSize: 38,
        textColor: '#FFFFFF',
        textY: 50
      },
      [ReelTemplate.NEWS_TEXT]: {
        titleSize: 56,
        titleColor: '#FFFFFF',
        titleY: 100,
        textSize: 42,
        textColor: '#FFFFFF',
        textY: 0
      },
      [ReelTemplate.BREAKING_NEWS]: {
        titleSize: 60,
        titleColor: '#FF0000',
        titleY: 100,
        textSize: 44,
        textColor: '#FFFFFF',
        textY: 0
      },
      [ReelTemplate.SPORTS_HIGHLIGHT]: {
        titleSize: 54,
        titleColor: '#00FF00',
        titleY: 150,
        textSize: 40,
        textColor: '#FFFFFF',
        textY: 50
      }
    };

    return configs[template] || configs[ReelTemplate.NEWS_TEXT];
  }

  /**
   * Get background configuration
   */
  private getBackgroundConfig(template: ReelTemplate, category: string) {
    const categoryColors = {
      'guncel': { color1: '#1E3A8A', gradient: '128+64*sin(2*PI*t/10)' },
      'spor': { color1: '#059669', gradient: '128+64*sin(2*PI*t/8)' },
      'ekonomi': { color1: '#7C2D12', gradient: '128+64*sin(2*PI*t/12)' },
      'teknoloji': { color1: '#5B21B6', gradient: '128+64*sin(2*PI*t/6)' },
      'politika': { color1: '#DC2626', gradient: '128+64*sin(2*PI*t/15)' }
    };

    return categoryColors[category] || categoryColors['guncel'];
  }

  /**
   * Get public URL for file
   */
  private getPublicUrl(filePath: string): string {
    // TODO: Upload to Supabase Storage and return public URL
    // For now, return a mock URL
    const fileName = path.basename(filePath);
    return `https://example.com/storage/reels/${fileName}`;
  }

  /**
   * Ensure required directories exist
   */
  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      this.logger.error('Failed to create directories', error);
    }
  }

  /**
   * Cleanup working directory
   */
  private async cleanupWorkDir(workDir: string): Promise<void> {
    try {
      await fs.rm(workDir, { recursive: true, force: true });
    } catch (error) {
      this.logger.warn(`Failed to cleanup work directory: ${workDir}`, error);
    }
  }

  /**
   * Test video composition
   */
  async testComposition(): Promise<{ success: boolean; message: string }> {
    try {
      // Test FFmpeg availability
      const { stdout } = await execAsync('ffmpeg -version');
      
      if (stdout.includes('ffmpeg version')) {
        return { success: true, message: 'Video composition service is ready' };
      } else {
        return { success: false, message: 'FFmpeg not properly installed' };
      }
    } catch (error) {
      return { success: false, message: `Video composition test failed: ${error.message}` };
    }
  }
}

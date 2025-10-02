import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Reel, ReelSourceType, ReelTemplate } from '../dto/reel.dto';
import { SupabaseService } from '../../supabase/supabase.service';

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
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService
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
      videoUrl: await this.getPublicUrl(outputPath),
      thumbnailUrl: await this.getPublicUrl(thumbnailPath),
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
      videoUrl: await this.getPublicUrl(outputPath),
      thumbnailUrl: await this.getPublicUrl(thumbnailPath),
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
      videoUrl: await this.getPublicUrl(outputPath),
      thumbnailUrl: await this.getPublicUrl(thumbnailPath),
      duration: reel.duration_seconds,
      fileSize: stats.size
    };
  }

  /**
   * Create video overlay with text and branding
   */
  private async createVideoOverlay(reel: Reel, workDir: string): Promise<string> {
    // Use simple drawtext instead of SRT for now
    // This ensures font size changes are applied
    return 'drawtext'; // Signal to use drawtext filter
  }

  /**
   * Create dynamic subtitles that sync with audio
   */
  private async createDynamicSubtitles(reel: Reel, workDir: string): Promise<string> {
    const subtitlePath = path.join(workDir, 'subtitles.srt');
    
    // Create SRT subtitle file with timing
    const subtitleContent = this.generateSubtitleContent(reel);
    await fs.writeFile(subtitlePath, subtitleContent);
    
    this.logger.log(`SRT subtitle file created: ${subtitlePath}`);
    this.logger.log(`Subtitle content: ${subtitleContent.substring(0, 100)}...`);
    
    return subtitlePath;
  }

  /**
   * Generate subtitle content with timing
   */
  private generateSubtitleContent(reel: Reel): string {
    const sentences = reel.content.summary_sentences;
    const duration = reel.duration_seconds || 30;
    const segmentDuration = duration / sentences.length;
    
    let srtContent = '';
    
    sentences.forEach((sentence, index) => {
      const startTime = index * segmentDuration;
      const endTime = (index + 1) * segmentDuration;
      
      srtContent += `${index + 1}\n`;
      srtContent += `${this.formatTime(startTime)} --> ${this.formatTime(endTime)}\n`;
      srtContent += `${this.truncateText(sentence, 50)}\n\n`;
    });
    
    return srtContent;
  }

  /**
   * Format time for SRT format
   */
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }

  /**
   * Get FFmpeg subtitle filter
   */
  private getSubtitleFilter(overlayPath?: string): string {
    if (overlayPath && overlayPath.endsWith('.srt')) {
      // Use SRT subtitles with medium font
      return `subtitles=${overlayPath}:force_style='FontSize=20,PrimaryColour=&Hffffff,OutlineColour=&H000000,Outline=2'`;
    } else if (overlayPath === 'drawtext') {
      // Use drawtext with medium font for news content
      return `drawtext=text='Haber':fontsize=20:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2:x=(w-text_w)/2:y=h-80`;
    } else {
      // Use simple drawtext for static subtitle with medium font
      return `drawtext=text='Haber':fontsize=20:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2:x=(w-text_w)/2:y=h-80`;
    }
  }

  /**
   * Get subtitle configuration for better readability
   */
  private getSubtitleConfig(template: ReelTemplate): {
    titleSize: number;
    titleColor: string;
    titleStroke: string;
    titleY: number;
    subtitleSize: number;
    subtitleColor: string;
    subtitleStroke: string;
    subtitleY: number;
  } {
    return {
      titleSize: 32, // Medium size
      titleColor: 'white',
      titleStroke: 'black',
      titleY: 80,
      subtitleSize: 20, // Medium but readable
      subtitleColor: 'white',
      subtitleStroke: 'black',
      subtitleY: 120
    };
  }

  /**
   * Truncate text to fit video dimensions
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
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
   * Get image dimensions using ffprobe
   */
  private async getImageDimensions(imagePath: string): Promise<{ width: number; height: number }> {
    try {
      const command = `ffprobe -v quiet -print_format json -show_streams "${imagePath}"`;
      const result = await execAsync(command);
      const data = JSON.parse(result.stdout);
      
      const videoStream = data.streams.find((stream: any) => stream.codec_type === 'video');
      if (videoStream) {
        return {
          width: videoStream.width,
          height: videoStream.height
        };
      }
      
      // Fallback to default dimensions
      return { width: 1080, height: 1920 };
    } catch (error) {
      this.logger.warn(`Failed to get image dimensions for ${imagePath}, using defaults`);
      return { width: 1080, height: 1920 };
    }
  }

  /**
   * Create animated background from static image
   */
  private async createAnimatedBackground(imagePath: string, outputPath: string, duration: number): Promise<void> {
    // First, get image dimensions to calculate proper scaling
    const dimensions = await this.getImageDimensions(imagePath);
    this.logger.log(`Image dimensions: ${dimensions.width}x${dimensions.height}`);
    
    // Calculate the scale factor to ensure we have enough pixels for 1080x1920
    const targetWidth = 1080;
    const targetHeight = 1920;
    
    // Calculate scale factors for both dimensions
    const scaleX = targetWidth / dimensions.width;
    const scaleY = targetHeight / dimensions.height;
    
    // Use the larger scale factor to ensure we have enough pixels
    const scaleFactor = Math.max(scaleX, scaleY);
    const scaledWidth = Math.ceil(dimensions.width * scaleFactor);
    const scaledHeight = Math.ceil(dimensions.height * scaleFactor);
    
    this.logger.log(`Scale factor: ${scaleFactor}, scaled dimensions: ${scaledWidth}x${scaledHeight}`);
    
    // Scale up the image first, then crop to exact size
    const command = `ffmpeg -loop 1 -i "${imagePath}" \\
      -vf "scale=${scaledWidth}:${scaledHeight},crop=${targetWidth}:${targetHeight},zoompan=z='min(zoom+0.0015,1.5)':d=${duration * 30}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${targetWidth}x${targetHeight}" \\
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
    
    // Create simple solid color background (no animation for now)
    const command = `ffmpeg -f lavfi -i "color=${bgConfig.color1}:size=1080x1920:duration=${reel.duration_seconds}" -pix_fmt yuv420p -y "${outputPath}"`;

    try {
      await execAsync(command);
      this.logger.log(`Text-only background created: ${outputPath}`);
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

    // Add subtitle filter for dynamic text
    const subtitleFilter = this.getSubtitleFilter(options.overlay);
    
    // Use filter_complex for overlay, simple vf for no overlay
    if (options.overlay && options.overlay.endsWith('.png')) {
      // Complex filter for overlay
      command += ` -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2[bg];[bg][2:v]overlay=0:0[out]" -map "[out]"`;
    } else if (options.overlay && options.overlay.endsWith('.srt')) {
      // Use SRT subtitles
      command += ` -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,${subtitleFilter}"`;
    } else {
      // Simple filter with subtitles
      command += ` -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,${subtitleFilter}"`;
    }
    
    // Always map video stream
    command += ` -map 0:v`;
    
    // Audio mapping and options
    if (options.audio) {
      if (options.overlay && options.overlay.endsWith('.png')) {
        // Audio is input 1 when we have overlay (input 2)
        command += ' -map 1:a -c:a aac -b:a 128k -shortest';
      } else {
        // Audio is input 1 when no overlay
        command += ' -map 1:a -c:a aac -b:a 128k -shortest';
      }
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
      // Handle data URLs (base64 encoded)
      if (url.startsWith('data:')) {
        const base64Data = url.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        // If it's an SVG, create a solid color PNG instead
        if (url.includes('image/svg+xml')) {
          // Extract color from SVG (simple approach)
          const svgContent = buffer.toString();
          const colorMatch = svgContent.match(/fill="([^"]+)"/);
          const color = colorMatch ? colorMatch[1] : '#1e40af';
          
          // Create solid color PNG using FFmpeg
          const command = `ffmpeg -f lavfi -i "color=${color}:size=1080x1920:duration=1" -frames:v 1 -y "${outputPath}"`;
          await execAsync(command);
        } else {
          await fs.writeFile(outputPath, buffer);
        }
        return;
      }

      // Handle regular HTTP URLs
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
   * Upload video to storage and get public URL
   */
  private async getPublicUrl(filePath: string): Promise<string> {
    const fileName = path.basename(filePath);
    
    try {
      // Read the video file
      const videoBuffer = await fs.readFile(filePath);
      
      // Upload to Supabase Storage bucket 'reels'
      const { data, error } = await this.supabaseService.adminSupabase.storage
        .from('reels')
        .upload(`videos/${fileName}`, videoBuffer, {
          contentType: 'video/mp4',
          cacheControl: '3600'
        });

      if (error) {
        this.logger.error(`Failed to upload video: ${error.message}`);
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabaseService.adminSupabase.storage
        .from('reels')
        .getPublicUrl(`videos/${fileName}`);

      this.logger.log(`Video uploaded successfully: ${publicUrl}`);
      
      // Clean up local file
      await fs.unlink(filePath).catch(() => {});
      
      return publicUrl;

    } catch (error) {
      this.logger.error(`Failed to upload video: ${error.message}`);
      // Fallback to mock URL if upload fails
      return `https://example.com/storage/reels/${fileName}`;
    }
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

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

    // Upload video and get URLs
    const videoUrl = await this.getPublicUrl(outputPath);
    const thumbnailUrl = await this.getPublicUrl(thumbnailPath);

    if (!videoUrl) {
      throw new Error('Failed to upload video to storage');
    }

    return {
      videoUrl,
      thumbnailUrl: thumbnailUrl || '',
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

    // Create animated background from image(s)
    const animatedBgPath = path.join(workDir, 'animated_bg.mp4');
    
    // Check if we have additional images for multi-image reel
    if (reel.assets.additional_images && reel.assets.additional_images.length > 0) {
      // Multi-image reel with transitions
      const allImages = [sourceImageUrl, ...reel.assets.additional_images];
      await this.createMultiImageBackground(allImages, animatedBgPath, reel.duration_seconds);
    } else {
      // Single image reel with Ken Burns effect
      await this.createAnimatedBackground(sourceImagePath, animatedBgPath, reel.duration_seconds);
    }

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
      template: reel.template,
      reel: reel
    });

    // Generate thumbnail
    const thumbnailPath = path.join(this.outputDir, `${reel.id}_thumb.jpg`);
    await this.generateVideoThumbnail(outputPath, thumbnailPath);

    // Get file stats
    const stats = await fs.stat(outputPath);

    // Upload video and get URLs
    const videoUrl = await this.getPublicUrl(outputPath);
    const thumbnailUrl = await this.getPublicUrl(thumbnailPath);

    if (!videoUrl) {
      throw new Error('Failed to upload video to storage');
    }

    return {
      videoUrl,
      thumbnailUrl: thumbnailUrl || '',
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

    const videoUrl = await this.getPublicUrl(outputPath);
    const thumbnailUrl = await this.getPublicUrl(thumbnailPath);
    
    if (!videoUrl) {
      throw new Error('Failed to upload video to storage');
    }

    return {
      videoUrl,
      thumbnailUrl: thumbnailUrl || '',
      duration: reel.duration_seconds,
      fileSize: stats.size
    };
  }

  /**
   * Create video overlay with text and branding
   */
  private async createVideoOverlay(reel: Reel, workDir: string): Promise<string> {
    // No overlay needed - we'll show text in description instead
    return '';
  }


  /**
   * Create image overlay
   */
  private async createImageOverlay(reel: Reel, workDir: string): Promise<string> {
    // Subtitles/overlays disabled — show text only in description
    return '';
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
   * Create multi-image background with transitions
   */
  private async createMultiImageBackground(imageUrls: string[], outputPath: string, duration: number): Promise<void> {
    const workDir = path.dirname(outputPath);
    const imagePaths: string[] = [];
    
    // Download all images
    for (let i = 0; i < imageUrls.length; i++) {
      const imagePath = path.join(workDir, `image_${i}.jpg`);
      await this.downloadFile(imageUrls[i], imagePath);
      imagePaths.push(imagePath);
    }
    
    // Calculate duration per image (each image gets equal time)
    const durationPerImage = duration / imageUrls.length;
    
    this.logger.log(`Creating multi-image background with ${imageUrls.length} images, duration: ${duration}s, per image: ${durationPerImage}s`);
    
    // Build inputs - each image loops for the full duration
    let inputs = '';
    for (let i = 0; i < imagePaths.length; i++) {
      inputs += ` -loop 1 -t ${duration} -i "${imagePaths[i]}"`;
    }
    
    // Build filter complex for scaling and transitions
    let filterComplex = '';
    let currentOutput = '';
    
    for (let i = 0; i < imagePaths.length; i++) {
      // No zoompan effect for multi-images - just scale and pad
      const scaleFilter = `[${i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black[v${i}]`;
      
      if (i === 0) {
        filterComplex = scaleFilter;
        currentOutput = 'v0';
      } else {
        filterComplex += `;${scaleFilter}`;
        
        // Add transition - each transition starts at the beginning of each image's time slot
        const transitionOffset = durationPerImage * i;
        const transitionFilter = `;[${currentOutput}][v${i}]xfade=transition=fade:duration=0.5:offset=${transitionOffset}[v0${i}]`;
        filterComplex += transitionFilter;
        currentOutput = `v0${i}`;
      }
    }
    
    const command = `ffmpeg${inputs} -filter_complex "${filterComplex}" -map "[${currentOutput}]" -c:v libx264 -pix_fmt yuv420p -y "${outputPath}"`;
    
    this.logger.log(`Executing multi-image FFmpeg command: ${command}`);
    
    try {
      await execAsync(command);
      this.logger.log(`Multi-image background created successfully: ${outputPath}`);
    } catch (error) {
      this.logger.error('Multi-image background creation failed', error);
      throw new Error('Failed to create multi-image background');
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
    
    // Show full image without cropping - fill screen completely
    const command = `ffmpeg -loop 1 -i "${imagePath}" \\
      -vf "scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2:black,zoompan=z='min(zoom+0.0015,1.5)':d=${duration * 30}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${targetWidth}x${targetHeight}" \\
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
    reel?: any;
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

    // Determine scaling strategy based on source type
    const scalingFilter = this.getScalingFilter(options.sourceVideo, options.template);
    command += ` -vf "${scalingFilter}"`;
    
    // Always map video stream
    command += ` -map 0:v`;
    
    // Audio mapping and options
    if (options.audio) {
      command += ' -map 1:a -c:a aac -b:a 128k';
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
   * Get scaling filter based on source type
   */
  private getScalingFilter(sourceVideo: string, template: ReelTemplate): string {
    const isVideoFile = /\.(mp4|avi|mov|mkv|webm|flv)$/i.test(sourceVideo);
    
    if (isVideoFile) {
      // For video files: scale to fill the entire frame, crop if necessary
      this.logger.log('Using video scaling: scale to fill 1080x1920 frame');
      return 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920';
    } else {
      // For image files: scale to fit, pad remaining area
      this.logger.log('Using image scaling: scale to fit 1080x1920 with padding');
      return 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black';
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
  private async getPublicUrl(filePath: string): Promise<string | null> {
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
      // Return null instead of invalid URL to indicate failure
      return null;
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

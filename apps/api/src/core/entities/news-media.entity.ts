/**
 * News Media entity representing the news_media table
 * Core domain entity for news media management
 */

export class NewsMediaEntity {
  id: string;
  newsId: string;
  mediaType: string;
  mediaRole: string;
  url: string;
  altText?: string;
  caption?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  displayOrder: number;
  isPrimary: boolean;
  qualityScore: number;
  sourceUrl?: string;
  extractionMethod?: string;
  createdAt: Date;

  constructor(data: Partial<NewsMediaEntity>) {
    this.id = data.id || '';
    this.newsId = data.newsId || '';
    this.mediaType = data.mediaType || 'image';
    this.mediaRole = data.mediaRole || 'GALLERY';
    this.url = data.url || '';
    this.altText = data.altText;
    this.caption = data.caption;
    this.width = data.width;
    this.height = data.height;
    this.fileSize = data.fileSize;
    this.mimeType = data.mimeType;
    this.duration = data.duration;
    this.displayOrder = data.displayOrder || 0;
    this.isPrimary = data.isPrimary || false;
    this.qualityScore = data.qualityScore || 0;
    this.sourceUrl = data.sourceUrl;
    this.extractionMethod = data.extractionMethod;
    this.createdAt = data.createdAt || new Date();
  }

  /**
   * Check if media is image
   */
  isImage(): boolean {
    return this.mediaType === 'image';
  }

  /**
   * Check if media is video
   */
  isVideo(): boolean {
    return this.mediaType === 'video';
  }

  /**
   * Check if media is audio
   */
  isAudio(): boolean {
    return this.mediaType === 'audio';
  }

  /**
   * Get aspect ratio
   */
  getAspectRatio(): number | null {
    if (!this.width || !this.height) return null;
    return this.width / this.height;
  }

  /**
   * Get file size in MB
   */
  getFileSizeMB(): number {
    if (!this.fileSize) return 0;
    return this.fileSize / (1024 * 1024);
  }

  /**
   * Get duration in minutes
   */
  getDurationMinutes(): number {
    if (!this.duration) return 0;
    return this.duration / 60;
  }

  /**
   * Check if media is high quality
   */
  isHighQuality(): boolean {
    return this.qualityScore >= 80;
  }

  /**
   * Get display dimensions
   */
  getDisplayDimensions(): string {
    if (!this.width || !this.height) return '';
    return `${this.width}x${this.height}`;
  }
}

export interface CreateNewsMediaData {
  newsId: string;
  mediaType: string;
  mediaRole?: string;
  url: string;
  altText?: string;
  caption?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  displayOrder?: number;
  isPrimary?: boolean;
  qualityScore?: number;
  sourceUrl?: string;
  extractionMethod?: string;
}

export interface UpdateNewsMediaData {
  mediaType?: string;
  mediaRole?: string;
  url?: string;
  altText?: string;
  caption?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  displayOrder?: number;
  isPrimary?: boolean;
  qualityScore?: number;
  sourceUrl?: string;
  extractionMethod?: string;
}

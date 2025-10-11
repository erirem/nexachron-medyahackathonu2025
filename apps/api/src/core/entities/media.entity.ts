/**
 * Base Media Entity
 * Common properties and methods for all media types
 */

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
}

export enum MediaRole {
  FEATURED = 'FEATURED',
  GALLERY = 'GALLERY',
  INLINE = 'INLINE',
  THUMBNAIL = 'THUMBNAIL',
  BACKGROUND = 'BACKGROUND',
}

export enum MediaStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
  DELETED = 'DELETED',
}

export interface CreateMediaData {
  mediaType: MediaType;
  mediaRole: MediaRole;
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
  metadata?: any;
  status?: MediaStatus;
}

export interface UpdateMediaData {
  mediaType?: MediaType;
  mediaRole?: MediaRole;
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
  metadata?: any;
  status?: MediaStatus;
}

export class MediaEntity {
  id: string;
  mediaType: MediaType;
  mediaRole: MediaRole;
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
  metadata?: any;
  status: MediaStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    media_type: MediaType;
    media_role: MediaRole;
    url: string;
    alt_text?: string;
    caption?: string;
    width?: number;
    height?: number;
    file_size?: number;
    mime_type?: string;
    duration?: number;
    display_order?: number;
    is_primary?: boolean;
    quality_score?: number;
    source_url?: string;
    extraction_method?: string;
    metadata?: any;
    status?: MediaStatus;
    created_at: string;
    updated_at: string;
  }) {
    this.id = data.id;
    this.mediaType = data.media_type;
    this.mediaRole = data.media_role;
    this.url = data.url;
    this.altText = data.alt_text;
    this.caption = data.caption;
    this.width = data.width;
    this.height = data.height;
    this.fileSize = data.file_size;
    this.mimeType = data.mime_type;
    this.duration = data.duration;
    this.displayOrder = data.display_order || 0;
    this.isPrimary = data.is_primary || false;
    this.qualityScore = data.quality_score || 0;
    this.sourceUrl = data.source_url;
    this.extractionMethod = data.extraction_method;
    this.metadata = data.metadata;
    this.status = data.status || MediaStatus.READY;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  // Business logic methods
  isImage(): boolean {
    return this.mediaType === MediaType.IMAGE;
  }

  isVideo(): boolean {
    return this.mediaType === MediaType.VIDEO;
  }

  isAudio(): boolean {
    return this.mediaType === MediaType.AUDIO;
  }

  isDocument(): boolean {
    return this.mediaType === MediaType.DOCUMENT;
  }

  getAspectRatio(): number | null {
    if (this.width && this.height && this.height > 0) {
      return this.width / this.height;
    }
    return null;
  }

  getFileSizeMB(): number | null {
    if (this.fileSize) {
      return this.fileSize / (1024 * 1024);
    }
    return null;
  }

  getDurationMinutes(): number | null {
    if (this.duration) {
      return this.duration / 60;
    }
    return null;
  }

  isHighQuality(): boolean {
    return this.qualityScore >= 70;
  }

  getDisplayDimensions(): { width?: number; height?: number } {
    return { width: this.width, height: this.height };
  }

  isReady(): boolean {
    return this.status === MediaStatus.READY;
  }

  isProcessing(): boolean {
    return this.status === MediaStatus.PROCESSING;
  }

  isFailed(): boolean {
    return this.status === MediaStatus.FAILED;
  }

  isPending(): boolean {
    return this.status === MediaStatus.PENDING;
  }

  getStatusColor(): string {
    switch (this.status) {
      case MediaStatus.READY:
        return 'green';
      case MediaStatus.PROCESSING:
        return 'yellow';
      case MediaStatus.FAILED:
        return 'red';
      case MediaStatus.PENDING:
        return 'blue';
      case MediaStatus.DELETED:
        return 'gray';
      default:
        return 'gray';
    }
  }

  getMediaInfo(): {
    type: string;
    size: string;
    dimensions: string;
    duration: string;
    quality: string;
  } {
    return {
      type: this.mediaType,
      size: this.getFileSizeMB() ? `${this.getFileSizeMB()?.toFixed(2)} MB` : 'Unknown',
      dimensions: this.width && this.height ? `${this.width}x${this.height}` : 'Unknown',
      duration: this.getDurationMinutes() ? `${this.getDurationMinutes()?.toFixed(2)} min` : 'N/A',
      quality: `${this.qualityScore}/100`,
    };
  }

  getThumbnailUrl(): string | null {
    // This would generate thumbnail URL based on media type
    if (this.isImage()) {
      return `${this.url}?w=300&h=200&fit=cover`;
    }
    if (this.isVideo()) {
      return `${this.url}?thumbnail=true&t=0`;
    }
    return null;
  }

  getPreviewUrl(): string | null {
    // This would generate preview URL
    if (this.isImage()) {
      return `${this.url}?w=800&h=600&fit=cover`;
    }
    if (this.isVideo()) {
      return `${this.url}?preview=true`;
    }
    return null;
  }

  getDownloadUrl(): string {
    return `${this.url}?download=true`;
  }

  getStreamUrl(): string | null {
    if (this.isVideo() || this.isAudio()) {
      return `${this.url}?stream=true`;
    }
    return null;
  }

  getMetadataValue(key: string): any {
    return this.metadata?.[key];
  }

  hasMetadata(): boolean {
    return this.metadata && Object.keys(this.metadata).length > 0;
  }

  getProcessingProgress(): number {
    if (this.isReady()) return 100;
    if (this.isFailed()) return 0;
    if (this.isPending()) return 0;
    if (this.isProcessing()) {
      // This would be calculated based on processing metadata
      return this.getMetadataValue('progress') || 50;
    }
    return 0;
  }

  getError(): string | null {
    if (this.isFailed()) {
      return this.getMetadataValue('error') || 'Processing failed';
    }
    return null;
  }

  getProcessingTime(): number | null {
    if (this.isReady() || this.isFailed()) {
      const startTime = this.getMetadataValue('processing_started_at');
      const endTime = this.getMetadataValue('processing_completed_at');
      if (startTime && endTime) {
        return new Date(endTime).getTime() - new Date(startTime).getTime();
      }
    }
    return null;
  }

  getStorageInfo(): {
    provider: string;
    bucket: string;
    path: string;
  } | null {
    const url = new URL(this.url);
    return {
      provider: url.hostname,
      bucket: url.pathname.split('/')[1] || 'default',
      path: url.pathname,
    };
  }

  getSecurityInfo(): {
    isPublic: boolean;
    accessLevel: string;
    expiresAt?: Date;
  } {
    return {
      isPublic: this.getMetadataValue('is_public') || false,
      accessLevel: this.getMetadataValue('access_level') || 'private',
      expiresAt: this.getMetadataValue('expires_at') ? new Date(this.getMetadataValue('expires_at')) : undefined,
    };
  }

  getUsageStats(): {
    views: number;
    downloads: number;
    shares: number;
    lastAccessed?: Date;
  } {
    return {
      views: this.getMetadataValue('views') || 0,
      downloads: this.getMetadataValue('downloads') || 0,
      shares: this.getMetadataValue('shares') || 0,
      lastAccessed: this.getMetadataValue('last_accessed') ? new Date(this.getMetadataValue('last_accessed')) : undefined,
    };
  }
}

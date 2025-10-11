/**
 * Reel Asset Entity
 * Represents media assets for reels
 */

export enum ReelAssetType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  BACKGROUND = 'BACKGROUND',
  THUMBNAIL = 'THUMBNAIL',
}

export enum ReelAssetStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED',
}

export interface CreateReelAssetData {
  reelId: string;
  assetType: ReelAssetType;
  url: string;
  originalUrl?: string;
  filename?: string;
  mimeType?: string;
  fileSize?: number;
  duration?: number;
  width?: number;
  height?: number;
  qualityScore?: number;
  metadata?: any;
  isPrimary?: boolean;
  displayOrder?: number;
}

export interface UpdateReelAssetData {
  url?: string;
  originalUrl?: string;
  filename?: string;
  mimeType?: string;
  fileSize?: number;
  duration?: number;
  width?: number;
  height?: number;
  qualityScore?: number;
  metadata?: any;
  isPrimary?: boolean;
  displayOrder?: number;
}

export class ReelAssetEntity {
  id: string;
  reelId: string;
  assetType: ReelAssetType;
  url: string;
  originalUrl?: string;
  filename?: string;
  mimeType?: string;
  fileSize?: number;
  duration?: number;
  width?: number;
  height?: number;
  qualityScore?: number;
  metadata?: any;
  isPrimary: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    reel_id: string;
    asset_type: ReelAssetType;
    url: string;
    original_url?: string;
    filename?: string;
    mime_type?: string;
    file_size?: number;
    duration?: number;
    width?: number;
    height?: number;
    quality_score?: number;
    metadata?: any;
    is_primary?: boolean;
    display_order?: number;
    created_at: string;
    updated_at: string;
  }) {
    this.id = data.id;
    this.reelId = data.reel_id;
    this.assetType = data.asset_type;
    this.url = data.url;
    this.originalUrl = data.original_url;
    this.filename = data.filename;
    this.mimeType = data.mime_type;
    this.fileSize = data.file_size;
    this.duration = data.duration;
    this.width = data.width;
    this.height = data.height;
    this.qualityScore = data.quality_score;
    this.metadata = data.metadata;
    this.isPrimary = data.is_primary || false;
    this.displayOrder = data.display_order || 0;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  // Business logic methods
  isVideo(): boolean {
    return this.assetType === ReelAssetType.VIDEO;
  }

  isImage(): boolean {
    return this.assetType === ReelAssetType.IMAGE;
  }

  isAudio(): boolean {
    return this.assetType === ReelAssetType.AUDIO;
  }

  isBackground(): boolean {
    return this.assetType === ReelAssetType.BACKGROUND;
  }

  isThumbnail(): boolean {
    return this.assetType === ReelAssetType.THUMBNAIL;
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
    return (this.qualityScore ?? 0) > 70;
  }

  getQualityLevel(): 'low' | 'medium' | 'high' {
    const score = this.qualityScore ?? 0;
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  getDisplayDimensions(): { width?: number; height?: number } {
    return { width: this.width, height: this.height };
  }

  isLandscape(): boolean {
    const aspectRatio = this.getAspectRatio();
    return aspectRatio ? aspectRatio > 1 : false;
  }

  isPortrait(): boolean {
    const aspectRatio = this.getAspectRatio();
    return aspectRatio ? aspectRatio < 1 : false;
  }

  isSquare(): boolean {
    const aspectRatio = this.getAspectRatio();
    return aspectRatio ? Math.abs(aspectRatio - 1) < 0.1 : false;
  }

  getMimeTypeCategory(): 'video' | 'image' | 'audio' | 'other' {
    if (!this.mimeType) return 'other';
    
    if (this.mimeType.startsWith('video/')) return 'video';
    if (this.mimeType.startsWith('image/')) return 'image';
    if (this.mimeType.startsWith('audio/')) return 'audio';
    return 'other';
  }

  getAssetInfo(): {
    id: string;
    reelId: string;
    assetType: string;
    url: string;
    filename?: string;
    mimeType?: string;
    fileSizeMB?: number;
    duration?: number;
    width?: number;
    height?: number;
    aspectRatio?: number;
    qualityScore?: number;
    isPrimary: boolean;
    displayOrder: number;
    isHighQuality: boolean;
    qualityLevel: string;
    mimeTypeCategory: string;
  } {
    return {
      id: this.id,
      reelId: this.reelId,
      assetType: this.assetType,
      url: this.url,
      filename: this.filename,
      mimeType: this.mimeType,
      fileSizeMB: this.getFileSizeMB() ?? undefined,
      duration: this.duration,
      width: this.width,
      height: this.height,
      aspectRatio: this.getAspectRatio() ?? undefined,
      qualityScore: this.qualityScore,
      isPrimary: this.isPrimary,
      displayOrder: this.displayOrder,
      isHighQuality: this.isHighQuality(),
      qualityLevel: this.getQualityLevel(),
      mimeTypeCategory: this.getMimeTypeCategory(),
    };
  }

  getAnalyticsData(): {
    assetId: string;
    reelId: string;
    assetType: string;
    fileSize: number | null;
    duration: number | null;
    width: number | null;
    height: number | null;
    qualityScore: number | null;
    isPrimary: boolean;
    displayOrder: number;
    createdAt: string;
    age: number;
  } {
    return {
      assetId: this.id,
      reelId: this.reelId,
      assetType: this.assetType,
      fileSize: this.fileSize ?? null,
      duration: this.duration ?? null,
      width: this.width ?? null,
      height: this.height ?? null,
      qualityScore: this.qualityScore ?? null,
      isPrimary: this.isPrimary,
      displayOrder: this.displayOrder,
      createdAt: this.createdAt.toISOString(),
      age: Date.now() - this.createdAt.getTime(),
    };
  }
}

/**
 * Reel Entity
 * Represents a short-form video content (reel)
 */

export enum ReelSourceType {
  NEWS = 'NEWS',
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  TEXT_ONLY = 'TEXT_ONLY',
}

export enum ReelStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED',
}

export enum ReelTemplate {
  NEWS_VIDEO = 'NEWS_VIDEO',
  NEWS_IMAGE = 'NEWS_IMAGE',
  NEWS_TEXT = 'NEWS_TEXT',
  BREAKING_NEWS = 'BREAKING_NEWS',
  SPORTS_HIGHLIGHT = 'SPORTS_HIGHLIGHT',
  WEATHER_UPDATE = 'WEATHER_UPDATE',
}

export interface CreateReelData {
  newsId?: string;
  title: string;
  description?: string;
  sourceType: ReelSourceType;
  template: ReelTemplate;
  status: ReelStatus;
  content: {
    headline: string;
    summarySentences: string[];
    summary_sentences?: string[]; // Database field
    hashtags: string[];
    captions?: string;
    callToAction?: string;
  };
  assets: {
    videoUrl?: string;
    thumbnailUrl?: string;
    audioUrl?: string;
    backgroundUrl?: string;
  };
  metadata?: any;
  createdBy?: string;
  isPublic?: boolean;
  priority?: number;
}

export interface UpdateReelData {
  title?: string;
  description?: string;
  status?: ReelStatus;
  content?: {
    headline?: string;
    summarySentences?: string[];
    summary_sentences?: string[];
    hashtags?: string[];
    captions?: string;
    callToAction?: string;
  };
  assets?: {
    videoUrl?: string;
    thumbnailUrl?: string;
    audioUrl?: string;
    backgroundUrl?: string;
  };
  metadata?: any;
  isPublic?: boolean;
  priority?: number;
}

export class ReelEntity {
  id: string;
  newsId?: string;
  get title(): string {
    return this.content?.headline || 'Untitled Reel';
  }
  get description(): string {
    // summary_sentences array'ini birleştir
    if (this.content?.summary_sentences && Array.isArray(this.content.summary_sentences)) {
      return this.content.summary_sentences.join(' ');
    }
    // Fallback: summarySentences array'ini birleştir
    if (this.content?.summarySentences && Array.isArray(this.content.summarySentences)) {
      return this.content.summarySentences.join(' ');
    }
    // Fallback: captions
    if (this.content?.captions) {
      return this.content.captions;
    }
    // Fallback: title
    return this.title || '';
  }
  sourceType: ReelSourceType;
  template: ReelTemplate;
  status: ReelStatus;
  content: {
    headline: string;
    summarySentences: string[];
    summary_sentences?: string[]; // Database field
    hashtags: string[];
    captions?: string;
    callToAction?: string;
  };
  assets: {
    videoUrl?: string;
    thumbnailUrl?: string;
    audioUrl?: string;
    backgroundUrl?: string;
  };
  metadata?: any;
  createdBy?: string;
  isPublic: boolean;
  priority: number;
  views: number;
  likes: number;
  shares: number;
  duration?: number;
  fileSize?: number;
  qualityScore?: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  archivedAt?: Date;

  constructor(data: {
    id: string;
    news_id?: string;
    source_type: ReelSourceType;
    template: ReelTemplate;
    status: ReelStatus;
    content: any;
    assets: any;
    metadata?: any;
    created_by?: string;
    is_public?: boolean;
    priority?: number;
    views?: number;
    likes?: number;
    shares?: number;
    duration?: number;
    file_size?: number;
    quality_score?: number;
    created_at: string;
    updated_at: string;
    published_at?: string;
    archived_at?: string;
  }) {
    console.log('ReelEntity constructor - data.content:', JSON.stringify(data.content, null, 2));
    this.id = data.id;
    this.newsId = data.news_id;
    this.sourceType = data.source_type;
    this.template = data.template;
    this.status = data.status;
    this.content = data.content;
    this.assets = data.assets;
    this.metadata = data.metadata;
    this.createdBy = data.created_by;
    this.isPublic = data.is_public || false;
    this.priority = data.priority || 0;
    this.views = data.views || 0;
    this.likes = data.likes || 0;
    this.shares = data.shares || 0;
    this.duration = data.duration;
    this.fileSize = data.file_size;
    this.qualityScore = data.quality_score;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
    this.publishedAt = data.published_at ? new Date(data.published_at) : undefined;
    this.archivedAt = data.archived_at ? new Date(data.archived_at) : undefined;
  }

  // Business logic methods
  isCompleted(): boolean {
    return this.status === ReelStatus.COMPLETED;
  }

  isProcessing(): boolean {
    return this.status === ReelStatus.PROCESSING;
  }

  isFailed(): boolean {
    return this.status === ReelStatus.FAILED;
  }

  isPending(): boolean {
    return this.status === ReelStatus.PENDING;
  }

  isArchived(): boolean {
    return this.status === ReelStatus.ARCHIVED;
  }

  isPublished(): boolean {
    return !!this.publishedAt;
  }

  getEngagementScore(): number {
    return this.views * 0.1 + this.likes * 0.5 + this.shares * 0.8;
  }

  getDurationMinutes(): number | null {
    if (this.duration) {
      return this.duration / 60;
    }
    return null;
  }

  getFileSizeMB(): number | null {
    if (this.fileSize) {
      return this.fileSize / (1024 * 1024);
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

  getStatusColor(): string {
    switch (this.status) {
      case ReelStatus.COMPLETED:
        return 'green';
      case ReelStatus.PROCESSING:
        return 'blue';
      case ReelStatus.FAILED:
        return 'red';
      case ReelStatus.PENDING:
        return 'yellow';
      case ReelStatus.ARCHIVED:
        return 'gray';
      default:
        return 'gray';
    }
  }

  getStatusText(): string {
    switch (this.status) {
      case ReelStatus.COMPLETED:
        return 'Tamamlandı';
      case ReelStatus.PROCESSING:
        return 'İşleniyor';
      case ReelStatus.FAILED:
        return 'Başarısız';
      case ReelStatus.PENDING:
        return 'Beklemede';
      case ReelStatus.ARCHIVED:
        return 'Arşivlendi';
      default:
        return 'Bilinmeyen';
    }
  }

  getDisplayDimensions(): { width?: number; height?: number } {
    // Default reel dimensions (9:16 aspect ratio)
    return { width: 720, height: 1280 };
  }

  getAge(): number {
    return Date.now() - this.createdAt.getTime();
  }

  getAgeHours(): number {
    return Math.floor(this.getAge() / (1000 * 60 * 60));
  }

  isRecent(hours: number = 24): boolean {
    return this.getAgeHours() < hours;
  }

  canBeShared(): boolean {
    return this.isPublic && this.isCompleted();
  }

  getShareInfo(): {
    canShare: boolean;
    shareUrl?: string;
    shareText?: string;
  } {
    return {
      canShare: this.canBeShared(),
      shareUrl: this.isPublic ? `/reels/${this.id}` : undefined,
      shareText: this.isPublic ? `Check out this reel: ${this.title}` : undefined,
    };
  }

  getAnalyticsData(): {
    reelId: string;
    newsId?: string;
    sourceType: string;
    template: string;
    status: string;
    views: number;
    likes: number;
    shares: number;
    engagementScore: number;
    qualityScore?: number;
    duration?: number;
    fileSize?: number;
    createdAt: string;
    publishedAt?: string;
    age: number;
    isPublic: boolean;
    isHighQuality: boolean;
  } {
    return {
      reelId: this.id,
      newsId: this.newsId,
      sourceType: this.sourceType,
      template: this.template,
      status: this.status,
      views: this.views,
      likes: this.likes,
      shares: this.shares,
      engagementScore: this.getEngagementScore(),
      qualityScore: this.qualityScore,
      duration: this.duration,
      fileSize: this.fileSize,
      createdAt: this.createdAt.toISOString(),
      publishedAt: this.publishedAt?.toISOString(),
      age: this.getAge(),
      isPublic: this.isPublic,
      isHighQuality: this.isHighQuality(),
    };
  }
}
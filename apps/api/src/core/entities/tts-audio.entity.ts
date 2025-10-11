/**
 * TTS Audio Entity
 * Represents text-to-speech audio content
 */

export enum TTSStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export enum TTSVoice {
  MALE_1 = 'MALE_1',
  MALE_2 = 'MALE_2',
  FEMALE_1 = 'FEMALE_1',
  FEMALE_2 = 'FEMALE_2',
  CHILD = 'CHILD',
  ELDERLY = 'ELDERLY',
}

export enum TTSEngine {
  GOOGLE = 'GOOGLE',
  AMAZON = 'AMAZON',
  MICROSOFT = 'MICROSOFT',
  OPENAI = 'OPENAI',
  ELEVENLABS = 'ELEVENLABS',
}

export interface CreateTTSAudioData {
  newsId: string;
  text: string;
  voice: TTSVoice;
  engine: TTSEngine;
  language: string;
  speed?: number;
  pitch?: number;
  volume?: number;
  status: TTSStatus;
  audioUrl?: string;
  duration?: number;
  fileSize?: number;
  qualityScore?: number;
  metadata?: any;
  expiresAt?: Date;
}

export interface UpdateTTSAudioData {
  text?: string;
  voice?: TTSVoice;
  engine?: TTSEngine;
  language?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
  status?: TTSStatus;
  audioUrl?: string;
  duration?: number;
  fileSize?: number;
  qualityScore?: number;
  metadata?: any;
  expiresAt?: Date;
}

export class TTSAudioEntity {
  id: string;
  newsId: string;
  text: string;
  voice: TTSVoice;
  engine: TTSEngine;
  language: string;
  speed: number;
  pitch: number;
  volume: number;
  status: TTSStatus;
  audioUrl?: string;
  duration?: number;
  fileSize?: number;
  qualityScore: number;
  metadata?: any;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    news_id: string;
    text: string;
    voice: TTSVoice;
    engine: TTSEngine;
    language: string;
    speed?: number;
    pitch?: number;
    volume?: number;
    status: TTSStatus;
    audio_url?: string;
    duration?: number;
    file_size?: number;
    quality_score?: number;
    metadata?: any;
    expires_at?: string;
    created_at: string;
    updated_at: string;
  }) {
    this.id = data.id;
    this.newsId = data.news_id;
    this.text = data.text;
    this.voice = data.voice;
    this.engine = data.engine;
    this.language = data.language;
    this.speed = data.speed || 1.0;
    this.pitch = data.pitch || 1.0;
    this.volume = data.volume || 1.0;
    this.status = data.status;
    this.audioUrl = data.audio_url;
    this.duration = data.duration;
    this.fileSize = data.file_size;
    this.qualityScore = data.quality_score || 0;
    this.metadata = data.metadata;
    this.expiresAt = data.expires_at ? new Date(data.expires_at) : undefined;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }

  // Business logic methods
  isPending(): boolean {
    return this.status === TTSStatus.PENDING;
  }

  isProcessing(): boolean {
    return this.status === TTSStatus.PROCESSING;
  }

  isReady(): boolean {
    return this.status === TTSStatus.READY;
  }

  isFailed(): boolean {
    return this.status === TTSStatus.FAILED;
  }

  isExpired(): boolean {
    return this.status === TTSStatus.EXPIRED;
  }

  isAvailable(): boolean {
    return this.isReady() && !this.isExpired();
  }

  getDurationMinutes(): number | null {
    if (this.duration) {
      return this.duration / 60;
    }
    return null;
  }

  getDurationFormatted(): string {
    if (!this.duration) return 'Unknown';
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getFileSizeMB(): number | null {
    if (this.fileSize) {
      return this.fileSize / (1024 * 1024);
    }
    return null;
  }

  isHighQuality(): boolean {
    return this.qualityScore >= 80;
  }

  getQualityLevel(): 'low' | 'medium' | 'high' | 'ultra' {
    if (this.qualityScore >= 90) return 'ultra';
    if (this.qualityScore >= 80) return 'high';
    if (this.qualityScore >= 60) return 'medium';
    return 'low';
  }

  getStatusColor(): string {
    switch (this.status) {
      case TTSStatus.READY:
        return 'green';
      case TTSStatus.PROCESSING:
        return 'yellow';
      case TTSStatus.FAILED:
        return 'red';
      case TTSStatus.EXPIRED:
        return 'orange';
      case TTSStatus.PENDING:
        return 'blue';
      default:
        return 'gray';
    }
  }

  getStatusText(): string {
    switch (this.status) {
      case TTSStatus.READY:
        return 'Ready';
      case TTSStatus.PROCESSING:
        return 'Processing';
      case TTSStatus.FAILED:
        return 'Failed';
      case TTSStatus.EXPIRED:
        return 'Expired';
      case TTSStatus.PENDING:
        return 'Pending';
      default:
        return 'Unknown';
    }
  }

  getVoiceText(): string {
    switch (this.voice) {
      case TTSVoice.MALE_1:
        return 'Male Voice 1';
      case TTSVoice.MALE_2:
        return 'Male Voice 2';
      case TTSVoice.FEMALE_1:
        return 'Female Voice 1';
      case TTSVoice.FEMALE_2:
        return 'Female Voice 2';
      case TTSVoice.CHILD:
        return 'Child Voice';
      case TTSVoice.ELDERLY:
        return 'Elderly Voice';
      default:
        return 'Unknown Voice';
    }
  }

  getEngineText(): string {
    switch (this.engine) {
      case TTSEngine.GOOGLE:
        return 'Google Cloud TTS';
      case TTSEngine.AMAZON:
        return 'Amazon Polly';
      case TTSEngine.MICROSOFT:
        return 'Microsoft Azure Speech';
      case TTSEngine.OPENAI:
        return 'OpenAI TTS';
      case TTSEngine.ELEVENLABS:
        return 'ElevenLabs';
      default:
        return 'Unknown Engine';
    }
  }

  getAudioInfo(): {
    url: string | null;
    duration: string;
    size: string;
    quality: string;
    voice: string;
    engine: string;
  } {
    return {
      url: this.audioUrl || null,
      duration: this.getDurationFormatted(),
      size: this.getFileSizeMB() ? `${this.getFileSizeMB()?.toFixed(2)} MB` : 'Unknown',
      quality: this.getQualityLevel(),
      voice: this.getVoiceText(),
      engine: this.getEngineText(),
    };
  }

  getProcessingInfo(): {
    progress: number;
    stage: string;
    estimatedTime: number | null;
    error: string | null;
  } {
    return {
      progress: this.getMetadataValue('processing_progress') || 0,
      stage: this.getMetadataValue('processing_stage') || 'Unknown',
      estimatedTime: this.getMetadataValue('estimated_completion_time'),
      error: this.getMetadataValue('processing_error'),
    };
  }

  getUsageStats(): {
    plays: number;
    downloads: number;
    shares: number;
    lastPlayed?: Date;
  } {
    return {
      plays: this.getMetadataValue('plays') || 0,
      downloads: this.getMetadataValue('downloads') || 0,
      shares: this.getMetadataValue('shares') || 0,
      lastPlayed: this.getMetadataValue('last_played') ? new Date(this.getMetadataValue('last_played')) : undefined,
    };
  }

  getMetadataValue(key: string): any {
    return this.metadata?.[key];
  }

  hasMetadata(): boolean {
    return this.metadata && Object.keys(this.metadata).length > 0;
  }

  getTextLength(): number {
    return this.text.length;
  }

  getWordCount(): number {
    return this.text.split(/\s+/).length;
  }

  getEstimatedDuration(): number {
    // Rough estimation: 150 words per minute
    const wordsPerMinute = 150;
    const wordCount = this.getWordCount();
    return (wordCount / wordsPerMinute) * 60; // in seconds
  }

  getReadingSpeed(): number {
    if (this.duration && this.getWordCount() > 0) {
      return (this.getWordCount() / (this.duration / 60)); // words per minute
    }
    return 0;
  }

  isExpiringSoon(hours: number = 24): boolean {
    if (!this.expiresAt) return false;
    const now = new Date();
    const timeUntilExpiry = this.expiresAt.getTime() - now.getTime();
    return timeUntilExpiry <= (hours * 60 * 60 * 1000);
  }

  getTimeUntilExpiry(): number | null {
    if (!this.expiresAt) return null;
    const now = new Date();
    return this.expiresAt.getTime() - now.getTime();
  }

  getAge(): number {
    return Date.now() - this.createdAt.getTime();
  }

  getAgeHours(): number {
    return Math.floor(this.getAge() / (1000 * 60 * 60));
  }

  isRecent(hours: number = 24): boolean {
    return this.getAgeHours() <= hours;
  }

  getCost(): number {
    // This would be calculated based on engine, duration, and usage
    const baseCost = this.getMetadataValue('base_cost') || 0;
    const usageCost = this.getMetadataValue('usage_cost') || 0;
    return baseCost + usageCost;
  }

  getAccessibilityInfo(): {
    hasSubtitles: boolean;
    hasTranscript: boolean;
    language: string;
    isAccessible: boolean;
  } {
    return {
      hasSubtitles: this.getMetadataValue('has_subtitles') || false,
      hasTranscript: this.getMetadataValue('has_transcript') || false,
      language: this.language,
      isAccessible: this.getMetadataValue('is_accessible') || false,
    };
  }

  getQualityMetrics(): {
    clarity: number;
    naturalness: number;
    pronunciation: number;
    overall: number;
  } {
    return {
      clarity: this.getMetadataValue('clarity_score') || 0,
      naturalness: this.getMetadataValue('naturalness_score') || 0,
      pronunciation: this.getMetadataValue('pronunciation_score') || 0,
      overall: this.qualityScore,
    };
  }

  getDownloadUrl(): string | null {
    if (this.isAvailable()) {
      return `${this.audioUrl}?download=true`;
    }
    return null;
  }

  getStreamUrl(): string | null {
    if (this.isAvailable()) {
      return `${this.audioUrl}?stream=true`;
    }
    return null;
  }

  getPreviewUrl(): string | null {
    if (this.isAvailable()) {
      return `${this.audioUrl}?preview=true&duration=30`;
    }
    return null;
  }
}

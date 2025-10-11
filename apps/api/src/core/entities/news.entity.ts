/**
 * News entity representing the news table
 * Core domain entity for news management
 */

export class NewsEntity {
  id: string;
  source?: string;
  title: string;
  content?: string;
  summary: string;
  imageUrl?: string;
  ttsUrl?: string;
  mode?: string;
  city: string;
  geo?: any;
  isPopular: boolean;
  category: string;
  description?: string;
  mediaSummary?: any;
  hasImages: boolean;
  hasVideos: boolean;
  hasGallery: boolean;
  mediaCount: number;
  videoUrl?: string;
  summaryType: string;
  originalUrl?: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<NewsEntity>) {
    this.id = data.id || '';
    this.source = data.source;
    this.title = data.title || '';
    this.content = data.content;
    this.summary = data.summary || '';
    this.imageUrl = data.imageUrl;
    this.ttsUrl = data.ttsUrl;
    this.mode = data.mode;
    this.city = data.city || 'İstanbul';
    this.geo = data.geo;
    this.isPopular = data.isPopular || false;
    this.category = data.category || 'genel';
    this.description = data.description;
    this.mediaSummary = data.mediaSummary;
    this.hasImages = data.hasImages || false;
    this.hasVideos = data.hasVideos || false;
    this.hasGallery = data.hasGallery || false;
    this.mediaCount = data.mediaCount || 0;
    this.videoUrl = data.videoUrl;
    this.summaryType = data.summaryType || 'original';
    this.originalUrl = data.originalUrl;
    this.publishedAt = data.publishedAt || new Date();
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Get display title (fallback to content if title is empty)
   */
  getDisplayTitle(): string {
    return this.title || this.content?.substring(0, 100) || 'Başlıksız';
  }

  /**
   * Get display summary (fallback to content if summary is empty)
   */
  getDisplaySummary(): string {
    if (this.summary && this.summary.trim().length > 0) {
      return this.summary.trim();
    }
    return this.truncateText(this.content || '', 180);
  }

  /**
   * Check if news has media
   */
  hasMedia(): boolean {
    return this.hasImages || this.hasVideos || this.hasGallery || this.mediaCount > 0;
  }

  /**
   * Check if news is recent (within last 24 hours)
   */
  isRecent(): boolean {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return this.createdAt > dayAgo;
  }

  /**
   * Get category display name
   */
  getCategoryDisplayName(): string {
    const categoryLabels: Record<string, string> = {
      gundem: 'Gündem',
      spor: 'Spor',
      ekonomi: 'Ekonomi',
      teknoloji: 'Teknoloji',
      dunya: 'Dünya',
      politika: 'Politika',
      finans: 'Finans',
      savunma: 'Savunma',
      enerji: 'Enerji',
      saglik: 'Sağlık',
      diplomasi: 'Diplomasi',
      cevre: 'Çevre',
      turizm: 'Turizm',
      tarim: 'Tarım',
      kultur: 'Kültür',
      sanat: 'Sanat',
      egitim: 'Eğitim',
      bilim: 'Bilim',
      yasam: 'Yaşam',
      magazin: 'Magazin',
      genel: 'Genel',
    };
    return categoryLabels[this.category] || this.category.charAt(0).toUpperCase() + this.category.slice(1);
  }

  /**
   * Truncate text to specified length
   */
  private truncateText(value: string, maxLength: number): string {
    if (!value) return '';
    if (value.length <= maxLength) return value.trim();
    
    const truncated = value.slice(0, maxLength);
    const lastWhitespace = truncated.lastIndexOf(' ');
    const finalText = lastWhitespace > 0 ? truncated.slice(0, lastWhitespace) : truncated;
    return `${finalText.trim()}...`;
  }
}

export interface CreateNewsData {
  source?: string;
  title: string;
  content?: string;
  summary: string;
  imageUrl?: string;
  ttsUrl?: string;
  mode?: string;
  city?: string;
  geo?: any;
  isPopular?: boolean;
  category?: string;
  description?: string;
  mediaSummary?: any;
  hasImages?: boolean;
  hasVideos?: boolean;
  hasGallery?: boolean;
  mediaCount?: number;
  videoUrl?: string;
  summaryType?: string;
  originalUrl?: string;
  publishedAt?: Date;
}

export interface UpdateNewsData {
  source?: string;
  title?: string;
  content?: string;
  summary?: string;
  imageUrl?: string;
  ttsUrl?: string;
  mode?: string;
  city?: string;
  geo?: any;
  isPopular?: boolean;
  category?: string;
  description?: string;
  mediaSummary?: any;
  hasImages?: boolean;
  hasVideos?: boolean;
  hasGallery?: boolean;
  mediaCount?: number;
  videoUrl?: string;
  summaryType?: string;
  originalUrl?: string;
  publishedAt?: Date;
}

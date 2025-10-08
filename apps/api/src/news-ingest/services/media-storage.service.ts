import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { MediaGallery } from '../dto/news-item.dto';

@Injectable()
export class MediaStorageService {
  private readonly logger = new Logger(MediaStorageService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Store all media for a news article
   */
  async storeNewsMedia(
    newsId: string,
    mediaGallery: MediaGallery,
  ): Promise<boolean> {
    if (
      !mediaGallery ||
      (mediaGallery.images.length === 0 && mediaGallery.videos.length === 0)
    ) {
      this.logger.debug(`No media to store for news: ${newsId}`);
      return true;
    }

    try {
      const mediaRecords: any[] = [];

      // Process images
      mediaGallery.images.forEach((image, index) => {
        mediaRecords.push({
          news_id: newsId,
          media_type: 'IMAGE',
          media_role: index === 0 ? 'FEATURED' : 'GALLERY',
          url: image.url,
          alt_text: image.alt || null,
          caption: image.caption || null,
          width: image.width || null,
          height: image.height || null,
          quality_score: Math.round(image.quality_score), // Keep as integer 0-100
          is_primary: index === 0, // First image is primary
          display_order: index,
          extraction_method: image.source || 'unknown',
          source_url: null, // Will be set to the original article URL if different
        });
      });

      // Process videos
      mediaGallery.videos.forEach((video, index) => {
        mediaRecords.push({
          news_id: newsId,
          media_type: 'VIDEO',
          media_role: index === 0 ? 'FEATURED' : 'GALLERY',
          url: video.url,
          alt_text: video.title || null,
          caption: null,
          width: null,
          height: null,
          duration: video.duration || null,
          quality_score: Math.round(video.quality_score), // Keep as integer 0-100
          is_primary: index === 0, // First video is primary
          display_order: index + mediaGallery.images.length, // Videos come after images in display order
          extraction_method: video.source || 'unknown',
          source_url: null,
        });
      });

      // Batch insert all media
      if (mediaRecords.length > 0) {
        const { error } = await this.supabaseService.adminSupabase
          .from('news_media')
          .insert(mediaRecords);

        if (error) {
          this.logger.error(`Failed to store media for news ${newsId}:`, error);
          return false;
        }

        this.logger.debug(
          `Stored ${mediaRecords.length} media items for news: ${newsId}`,
        );
      }

      return true;
    } catch (error) {
      this.logger.error(`Error storing media for news ${newsId}:`, error);
      return false;
    }
  }

  /**
   * Get all media for a news article with quick access patterns
   */
  async getNewsMedia(newsId: string): Promise<{
    featured_image?: string;
    featured_video?: string;
    images: Array<{
      id: string;
      url: string;
      alt_text?: string;
      caption?: string;
      width?: number;
      height?: number;
      quality_score: number;
    }>;
    videos: Array<{
      id: string;
      url: string;
      title?: string;
      duration?: number;
      quality_score: number;
    }>;
    total_count: number;
  }> {
    try {
      const { data: mediaItems, error } = await this.supabaseService.supabase
        .from('news_media')
        .select('*')
        .eq('news_id', newsId)
        .order('quality_score', { ascending: false });

      if (error) {
        this.logger.error(`Failed to get media for news ${newsId}:`, error);
        return { images: [], videos: [], total_count: 0 };
      }

      if (!mediaItems || mediaItems.length === 0) {
        return { images: [], videos: [], total_count: 0 };
      }

      const images = mediaItems
        .filter((item) => item.media_type === 'IMAGE')
        .map((item) => ({
          id: item.id,
          url: item.url,
          alt_text: item.alt_text,
          caption: item.caption,
          width: item.width,
          height: item.height,
          quality_score: item.quality_score,
        }));

      const videos = mediaItems
        .filter((item) => item.media_type === 'VIDEO')
        .map((item) => ({
          id: item.id,
          url: item.url,
          title: item.alt_text, // We store video title in alt_text
          duration: item.duration,
          quality_score: item.quality_score,
        }));

      // Get featured media (highest quality of each type)
      const featuredImage = images.length > 0 ? images[0].url : undefined;
      const featuredVideo = videos.length > 0 ? videos[0].url : undefined;

      return {
        featured_image: featuredImage,
        featured_video: featuredVideo,
        images,
        videos,
        total_count: mediaItems.length,
      };
    } catch (error) {
      this.logger.error(`Error getting media for news ${newsId}:`, error);
      return { images: [], videos: [], total_count: 0 };
    }
  }

  /**
   * Get media statistics for monitoring
   */
  async getMediaStats(): Promise<{
    total_media: number;
    total_images: number;
    total_videos: number;
    articles_with_media: number;
    articles_with_galleries: number;
  }> {
    try {
      const { data: mediaItems, error } = await this.supabaseService.supabase
        .from('news_media')
        .select('media_type, news_id');

      if (error) {
        this.logger.error('Error getting media statistics:', error);
        return {
          total_media: 0,
          total_images: 0,
          total_videos: 0,
          articles_with_media: 0,
          articles_with_galleries: 0,
        };
      }

      if (!mediaItems || mediaItems.length === 0) {
        return {
          total_media: 0,
          total_images: 0,
          total_videos: 0,
          articles_with_media: 0,
          articles_with_galleries: 0,
        };
      }

      const totalMedia = mediaItems.length;
      const totalImages = mediaItems.filter(
        (item) => item.media_type === 'IMAGE',
      ).length;
      const totalVideos = mediaItems.filter(
        (item) => item.media_type === 'VIDEO',
      ).length;
      const uniqueNewsIds = new Set(mediaItems.map((item) => item.news_id))
        .size;

      // Count articles with multiple images (galleries)
      const mediaByNews = mediaItems.reduce(
        (acc, item) => {
          if (!acc[item.news_id]) acc[item.news_id] = { images: 0, videos: 0 };
          if (item.media_type === 'IMAGE') acc[item.news_id].images++;
          if (item.media_type === 'VIDEO') acc[item.news_id].videos++;
          return acc;
        },
        {} as Record<string, { images: number; videos: number }>,
      );

      const galleriesCount = Object.values(mediaByNews).filter(
        (counts) => counts.images > 1 || counts.videos > 1,
      ).length;

      return {
        total_media: totalMedia,
        total_images: totalImages,
        total_videos: totalVideos,
        articles_with_media: uniqueNewsIds,
        articles_with_galleries: galleriesCount,
      };
    } catch (error) {
      this.logger.error('Error getting media statistics:', error);
      return {
        total_media: 0,
        total_images: 0,
        total_videos: 0,
        articles_with_media: 0,
        articles_with_galleries: 0,
      };
    }
  }

  /**
   * Get recent media statistics to see filtering improvements
   */
  async getRecentMediaStats(limit: number = 10): Promise<{
    limit: number;
    articles_analyzed: number;
    average_images_per_article: number;
    average_videos_per_article: number;
    total_media: number;
    articles_with_galleries: number;
    article_details: Array<{
      title: string;
      category: string;
      created_at: string;
      image_count: number;
      video_count: number;
      total_media: number;
    }>;
  }> {
    try {
      // Get recent news with their media counts
      const { data: recentNews, error: newsError } =
        await this.supabaseService.supabase
          .from('news')
          .select('id, title, category, created_at')
          .order('created_at', { ascending: false })
          .limit(limit);

      if (newsError || !recentNews) {
        this.logger.error('Error getting recent news:', newsError);
        return {
          limit,
          articles_analyzed: 0,
          average_images_per_article: 0,
          average_videos_per_article: 0,
          total_media: 0,
          articles_with_galleries: 0,
          article_details: [],
        };
      }

      const articleDetails: Array<{
        title: string;
        category: string;
        created_at: string;
        image_count: number;
        video_count: number;
        total_media: number;
      }> = [];

      let totalImages = 0;
      let totalVideos = 0;
      let galleriesCount = 0;

      // Get media counts for each recent article
      for (const article of recentNews) {
        const { data: mediaItems, error: mediaError } =
          await this.supabaseService.supabase
            .from('news_media')
            .select('media_type')
            .eq('news_id', article.id);

        if (mediaError) {
          this.logger.warn(
            `Error getting media for article ${article.id}:`,
            mediaError,
          );
          continue;
        }

        const imageCount =
          mediaItems?.filter((item) => item.media_type === 'IMAGE').length || 0;
        const videoCount =
          mediaItems?.filter((item) => item.media_type === 'VIDEO').length || 0;
        const totalMedia = imageCount + videoCount;

        totalImages += imageCount;
        totalVideos += videoCount;

        if (totalMedia > 1) {
          galleriesCount++;
        }

        articleDetails.push({
          title:
            article.title.substring(0, 80) +
            (article.title.length > 80 ? '...' : ''),
          category: article.category || 'unknown',
          created_at: article.created_at,
          image_count: imageCount,
          video_count: videoCount,
          total_media: totalMedia,
        });
      }

      const articlesAnalyzed = recentNews.length;
      const avgImages =
        articlesAnalyzed > 0 ? totalImages / articlesAnalyzed : 0;
      const avgVideos =
        articlesAnalyzed > 0 ? totalVideos / articlesAnalyzed : 0;

      return {
        limit,
        articles_analyzed: articlesAnalyzed,
        average_images_per_article: Math.round(avgImages * 100) / 100,
        average_videos_per_article: Math.round(avgVideos * 100) / 100,
        total_media: totalImages + totalVideos,
        articles_with_galleries: galleriesCount,
        article_details: articleDetails,
      };
    } catch (error) {
      this.logger.error('Error getting recent media statistics:', error);
      return {
        limit,
        articles_analyzed: 0,
        average_images_per_article: 0,
        average_videos_per_article: 0,
        total_media: 0,
        articles_with_galleries: 0,
        article_details: [],
      };
    }
  }
}

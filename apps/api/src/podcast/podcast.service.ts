import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface PodcastDto {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  image_url: string;
  audio_url?: string;
  duration: number; // in seconds
  category: string;
  is_featured: boolean;
  is_trending: boolean;
  play_count: number;
  created_at: string;
  updated_at: string;
}

export interface PodcastCategoryDto {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  podcast_count: number;
}

export interface FindPodcastsOptions {
  page?: number;
  pageSize?: number;
  limit?: number;
  category?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  includeCount?: boolean;
}

export interface FindPodcastsResult {
  items: PodcastDto[];
  total?: number;
}

@Injectable()
export class PodcastService {
  private readonly logger = new Logger(PodcastService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(options: FindPodcastsOptions): Promise<FindPodcastsResult> {
    try {
      let query = this.supabaseService.supabase
        .from('podcasts')
        .select(`
          id,
          title,
          subtitle,
          description,
          image_url,
          audio_url,
          duration,
          category,
          is_featured,
          is_trending,
          play_count,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (options.category) {
        query = query.eq('category', options.category);
      }

      if (options.isFeatured !== undefined) {
        query = query.eq('is_featured', options.isFeatured);
      }

      if (options.isTrending !== undefined) {
        query = query.eq('is_trending', options.isTrending);
      }

      // Apply pagination or limit
      if (options.page && options.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      } else if (options.limit) {
        query = query.limit(options.limit);
      }

      // Get count if needed
      let countQuery;
      if (options.includeCount) {
        countQuery = this.supabaseService.supabase
          .from('podcasts')
          .select('*', { count: 'exact', head: true });

        if (options.category) {
          countQuery = countQuery.eq('category', options.category);
        }

        if (options.isFeatured !== undefined) {
          countQuery = countQuery.eq('is_featured', options.isFeatured);
        }

        if (options.isTrending !== undefined) {
          countQuery = countQuery.eq('is_trending', options.isTrending);
        }
      }

      const [result, countResult] = await Promise.all([
        query,
        countQuery ? countQuery : Promise.resolve({ count: null }),
      ]);

      if (result.error) {
        throw new Error(`Failed to fetch podcasts: ${result.error.message}`);
      }

      return {
        items: result.data || [],
        total: countResult?.count || undefined,
      };
    } catch (error) {
      this.logger.error('Error fetching podcasts', error);
      throw error;
    }
  }

  async findById(id: string): Promise<PodcastDto | null> {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('podcasts')
        .select(`
          id,
          title,
          subtitle,
          description,
          image_url,
          audio_url,
          duration,
          category,
          is_featured,
          is_trending,
          play_count,
          created_at,
          updated_at
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch podcast: ${error.message}`);
      }

      return data;
    } catch (error) {
      this.logger.error(`Error fetching podcast with id: ${id}`, error);
      throw error;
    }
  }

  async getFeaturedPodcasts(limit: number): Promise<PodcastDto[]> {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('podcasts')
        .select(`
          id,
          title,
          subtitle,
          description,
          image_url,
          audio_url,
          duration,
          category,
          is_featured,
          is_trending,
          play_count,
          created_at,
          updated_at
        `)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch featured podcasts: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error fetching featured podcasts', error);
      throw error;
    }
  }

  async getTrendingPodcasts(limit: number): Promise<PodcastDto[]> {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('podcasts')
        .select(`
          id,
          title,
          subtitle,
          description,
          image_url,
          audio_url,
          duration,
          category,
          is_featured,
          is_trending,
          play_count,
          created_at,
          updated_at
        `)
        .eq('is_trending', true)
        .order('play_count', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch trending podcasts: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error fetching trending podcasts', error);
      throw error;
    }
  }

  async getCategories(): Promise<PodcastCategoryDto[]> {
    try {
      // Get categories with podcast counts
      const { data, error } = await this.supabaseService.supabase
        .from('podcast_categories')
        .select(`
          id,
          name,
          description,
          icon,
          color,
          podcast_count
        `)
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch podcast categories: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error fetching podcast categories', error);
      throw error;
    }
  }

  async getAudioUrl(podcastId: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('podcasts')
        .select('audio_url')
        .eq('id', podcastId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch podcast audio: ${error.message}`);
      }

      return data?.audio_url || null;
    } catch (error) {
      this.logger.error(`Error fetching audio for podcast: ${podcastId}`, error);
      throw error;
    }
  }

  async incrementPlayCount(podcastId: string): Promise<void> {
    try {
      const { error } = await this.supabaseService.supabase
        .from('podcasts')
        .update({ play_count: this.supabaseService.supabase.raw('play_count + 1') })
        .eq('id', podcastId);

      if (error) {
        throw new Error(`Failed to increment play count: ${error.message}`);
      }
    } catch (error) {
      this.logger.error(`Error incrementing play count for podcast: ${podcastId}`, error);
      throw error;
    }
  }
}

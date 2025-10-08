export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      news: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: string | null;
          mode: string;
          city: string | null;
          is_popular: boolean;
          created_at: string;
          updated_at: string | null;
          summary: string | null;
          media_summary: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category?: string | null;
          mode?: string;
          city?: string | null;
          is_popular?: boolean;
          created_at?: string;
          updated_at?: string | null;
          summary?: string | null;
          media_summary?: string | null;
        };
        Update: {
          title?: string;
          content?: string;
          category?: string | null;
          mode?: string;
          city?: string | null;
          is_popular?: boolean;
          created_at?: string;
          updated_at?: string | null;
          summary?: string | null;
          media_summary?: string | null;
        };
        Relationships: [];
      };
      news_media: {
        Row: {
          id: string;
          news_id: string;
          media_url: string;
          media_type: 'image' | 'video';
          created_at: string | null;
          updated_at: string | null;
          order_index: number | null;
        };
        Insert: {
          id?: string;
          news_id: string;
          media_url: string;
          media_type: 'image' | 'video';
          created_at?: string | null;
          updated_at?: string | null;
          order_index?: number | null;
        };
        Update: {
          news_id?: string;
          media_url?: string;
          media_type?: 'image' | 'video';
          created_at?: string | null;
          updated_at?: string | null;
          order_index?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'news_media_news_id_fkey';
            columns: ['news_id'];
            referencedRelation: 'news';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          id: string;
          email: string | null;
          username: string | null;
          city: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          username?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          username?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_stats: {
        Row: {
          user_id: string;
          xp: number;
          streak: number;
          rank_level: number;
          last_seen: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          xp?: number;
          streak?: number;
          rank_level?: number;
          last_seen?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          xp?: number;
          streak?: number;
          rank_level?: number;
          last_seen?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_stats_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type NewsRow = Database['public']['Tables']['news']['Row'];
export type NewsInsert = Database['public']['Tables']['news']['Insert'];
export type NewsUpdate = Database['public']['Tables']['news']['Update'];
export type NewsMediaRow = Database['public']['Tables']['news_media']['Row'];
export type NewsMediaInsert = Database['public']['Tables']['news_media']['Insert'];
export type NewsMediaUpdate = Database['public']['Tables']['news_media']['Update'];

export interface NewsMediaDto {
  id: string;
  url: string;
  type: 'image' | 'video';
  order: number | null;
}

export interface NewsWithMediaDto {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string | null; // DB'deki category kolonu
  city: string | null;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string | null;
  publishedAt: string | null;
  media: NewsMediaDto[];
  primaryMedia: NewsMediaDto | null;
  media_summary?: string | null;
}

export type DashboardNewsItem = NewsWithMediaDto;

export interface DashboardNewsResponse {
  items: DashboardNewsItem[];
  total: number;
}

export interface PaginatedResultMeta {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface PaginatedNewsResponse {
  items: NewsWithMediaDto[];
  pagination: PaginatedResultMeta;
}

export interface TrendingNewsResponse {
  items: NewsWithMediaDto[];
  total: number;
}

export interface SearchNewsResponse {
  items: NewsWithMediaDto[];
  total: number;
  query: string;
}

export interface NewsCategorySummary {
  id: string;
  label: string;
  total: number;
}

export interface CategoriesOverviewResponse {
  categories: NewsCategorySummary[];
  total: number;
}

export interface CategoryNewsDetailResponse {
  categoryId: string;
  categories: NewsCategorySummary[];
  items: NewsWithMediaDto[];
  pagination: PaginatedResultMeta;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
}

export interface ApiErrorEnvelope {
  success: false;
  error: string;
}

export type ApiResponseEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export interface NewsListDataPayload {
  items: NewsWithMediaDto[];
  pagination: PaginatedResultMeta;
}

export interface DashboardNewsDataPayload {
  items: DashboardNewsItem[];
  total: number;
}

export interface TrendingNewsDataPayload {
  items: NewsWithMediaDto[];
  total: number;
}

export interface SearchNewsDataPayload {
  items: NewsWithMediaDto[];
  total: number;
  query: string;
}

export interface FindNewsOptions {
  limit?: number;
  page?: number;
  pageSize?: number;
  categoryId?: string;
  city?: string;
  isPopular?: boolean;
  search?: string;
  includeCount?: boolean;
  order?: 'asc' | 'desc';
}

export type FindNewsResult = {
  items: NewsWithMediaDto[];
  total: number;
};

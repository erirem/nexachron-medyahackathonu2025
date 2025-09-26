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

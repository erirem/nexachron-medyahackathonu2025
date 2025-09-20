import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }

    this.client = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
        db: {
          schema: 'public',
        },
      },
    );
  }

  get supabase(): SupabaseClient {
    return this.client;
  }
}
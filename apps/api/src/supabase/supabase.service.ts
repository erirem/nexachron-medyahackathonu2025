import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private anonClient: SupabaseClient;
  private serviceClient: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !anonKey) {
      throw new Error('Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }

    // Anon client for regular operations (respects RLS)
    this.anonClient = createClient(
      supabaseUrl,
      anonKey,
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

    // Service role client for backend operations (bypasses RLS)
    if (serviceKey) {
      this.serviceClient = createClient(
        supabaseUrl,
        serviceKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
          db: {
            schema: 'public',
          },
        },
      );
    }
  }

  // Default client (anon) for frontend-like operations
  get supabase(): SupabaseClient {
    return this.anonClient;
  }

  // Service role client for backend operations (bypasses RLS)
  get adminSupabase(): SupabaseClient {
    if (!this.serviceClient) {
      throw new Error('Service role key not configured. Cannot perform admin operations.');
    }
    return this.serviceClient;
  }
}
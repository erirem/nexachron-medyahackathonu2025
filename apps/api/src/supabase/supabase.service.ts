import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.client = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_ANON_KEY'),
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
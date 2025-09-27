import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private anonClient!: SupabaseClient<Database, 'public', any>;
  private serviceClient?: SupabaseClient<Database, 'public', any>;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const serviceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl) {
      throw new Error(
        'Missing Supabase configuration: SUPABASE_URL is required.',
      );
    }
    if (!anonKey && !serviceKey) {
      throw new Error(
        'Missing Supabase keys. Provide at least one of SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY.',
      );
    }

    // Varsayılan (RLS'e tabi) client — önce ANON, yoksa SERVICE
    const keyForDefault = anonKey ?? serviceKey!;
    if (!anonKey && serviceKey) {
      // İsteğe bağlı: log/uyarı – default client service key ile kuruluyor
      // console.warn('[Supabase] ANON key missing; default client is using SERVICE_ROLE key.');
    }
    this.anonClient = createClient<Database>(supabaseUrl, keyForDefault, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: { schema: 'public' },
    });

    // Admin (RLS bypass) client — yalnızca SERVICE_ROLE mevcutsa
    if (serviceKey) {
      this.serviceClient = createClient<Database>(supabaseUrl, serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        db: { schema: 'public' },
      });
    }
  }

  // Varsayılan client (tercihen ANON; yoksa SERVICE ile oluşturulmuş olabilir)
  get supabase(): SupabaseClient<Database, 'public', any> {
    if (!this.anonClient) {
      throw new Error('Supabase client not initialized.');
    }
    return this.anonClient;
  }

  // Admin client (SERVICE_ROLE gerekir)
  get adminSupabase(): SupabaseClient<Database, 'public', any> {
    if (!this.serviceClient) {
      throw new Error(
        'Service role key not configured. Cannot perform admin operations.',
      );
    }
    return this.serviceClient;
  }
}

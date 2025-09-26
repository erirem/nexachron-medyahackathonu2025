import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SupabaseService } from './supabase/supabase.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      message: 'Nexachron News Ingest API is running',
    };
  }

  @Get('supabase-test')
  async testSupabase() {
    try {
      const client = this.supabaseService.supabase;

      if (!client) {
        throw new Error('Supabase client not initialized');
      }

      // Test your news table specifically using admin client
      const adminClient = this.supabaseService.adminSupabase;
      const { data: newsTest, error: newsError } = await adminClient
        .from('news')
        .select('id, title, mode, created_at')
        .limit(5);

      const { count: totalNews } = await adminClient
        .from('news')
        .select('id', { count: 'exact' });

      return {
        status: newsError ? 'error' : 'success',
        message: newsError
          ? `News table error: ${newsError.message}`
          : `News table working! ${totalNews || 0} items found`,
        supabaseUrl: process.env.SUPABASE_URL,
        hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
        newsTable: {
          totalCount: totalNews || 0,
          sampleItems:
            newsTest?.map((item) => ({
              title: item.title?.substring(0, 50) + '...',
              mode: item.mode,
              created: item.created_at,
            })) || [],
          error: newsError?.message || null,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        status: 'error',
        message: 'Supabase connection failed',
        error: err.message,
        supabaseUrl: process.env.SUPABASE_URL,
        hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

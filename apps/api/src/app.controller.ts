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
      const adminClient = this.supabaseService.adminSupabase;

      if (!client) {
        throw new Error('Supabase client not initialized');
      }

      // ---- feat/auth-improvements: gelişmiş tablo kontrolleri (anon/public client) ----
      const tableTests = await Promise.allSettled([
        client.from('users').select('*').limit(1),
        client.from('news').select('*').limit(1),
        client.from('cards').select('*').limit(1),
        client.from('quizzes').select('*').limit(1),
        client.from('user_stats').select('*').limit(1),
      ]);

      const tableResults = {
        users:
          tableTests[0].status === 'fulfilled'
            ? tableTests[0].value.error?.message || 'OK'
            : 'Failed',
        news:
          tableTests[1].status === 'fulfilled'
            ? tableTests[1].value.error?.message || 'OK'
            : 'Failed',
        cards:
          tableTests[2].status === 'fulfilled'
            ? tableTests[2].value.error?.message || 'OK'
            : 'Failed',
        quizzes:
          tableTests[3].status === 'fulfilled'
            ? tableTests[3].value.error?.message || 'OK'
            : 'Failed',
        user_stats:
          tableTests[4].status === 'fulfilled'
            ? tableTests[4].value.error?.message || 'OK'
            : 'Failed',
      };

      const allTablesOK = Object.values(tableResults).every((r) => r === 'OK');

      // ---- main: admin client ile news tablosu testi ----
      let newsSummary: {
        totalCount: number;
        sampleItems: Array<{ title: string; mode: string | null; created: string | null }>;
        error: string | null;
      } = { totalCount: 0, sampleItems: [], error: null };

      if (adminClient) {
        const { data: newsTest, error: newsError } = await adminClient
          .from('news')
          .select('id, title, mode, created_at')
          .limit(5);

        const { count: totalNews, error: countError } = await adminClient
          .from('news')
          .select('id', { count: 'exact', head: true });

        newsSummary = {
          totalCount: totalNews || 0,
          sampleItems:
            newsTest?.map((item: any) => ({
              title: (item.title ?? '').slice(0, 50) + (item.title?.length > 50 ? '...' : ''),
              mode: item.mode ?? null,
              created: item.created_at ?? null,
            })) || [],
          error: newsError?.message || countError?.message || null,
        };
      } else {
        newsSummary = {
          totalCount: 0,
          sampleItems: [],
          error: 'Admin Supabase client not initialized',
        };
      }

      const hasNewsError = !!newsSummary.error;
      const status = allTablesOK && !hasNewsError ? 'success' : (allTablesOK || !hasNewsError ? 'partial' : 'error');

      return {
        status,
        message:
          status === 'success'
            ? 'All checks passed!'
            : status === 'partial'
            ? 'Some checks failed or are missing configuration'
            : 'Checks failed',
        supabaseUrl: process.env.SUPABASE_URL,
        hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
        tableTests: tableResults,
        newsTable: newsSummary,
        hint:
          allTablesOK && !hasNewsError
            ? '🎉 Ready for development!'
            : '📋 Supabase şemasını ve RLS/Policy ayarlarını kontrol edin',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        status: 'error',
        message: 'Supabase connection failed',
        error: err?.message ?? String(err),
        supabaseUrl: process.env.SUPABASE_URL,
        hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
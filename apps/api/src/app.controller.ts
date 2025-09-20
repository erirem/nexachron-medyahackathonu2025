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
    };
  }

  @Get('supabase-test')
  async testSupabase() {
    try {
      const client = this.supabaseService.supabase;
      
      if (!client) {
        throw new Error('Supabase client not initialized');
      }

      // Test advanced schema tables
      const tableTests = await Promise.allSettled([
        client.from('users').select('*').limit(1),
        client.from('news').select('*').limit(1), 
        client.from('cards').select('*').limit(1),
        client.from('quizzes').select('*').limit(1),
        client.from('user_stats').select('*').limit(1),
      ]);

      const results = {
        users: tableTests[0].status === 'fulfilled' ? (tableTests[0].value.error?.message || 'OK') : 'Failed',
        news: tableTests[1].status === 'fulfilled' ? (tableTests[1].value.error?.message || 'OK') : 'Failed',
        cards: tableTests[2].status === 'fulfilled' ? (tableTests[2].value.error?.message || 'OK') : 'Failed',
        quizzes: tableTests[3].status === 'fulfilled' ? (tableTests[3].value.error?.message || 'OK') : 'Failed',
        user_stats: tableTests[4].status === 'fulfilled' ? (tableTests[4].value.error?.message || 'OK') : 'Failed',
      };

      const allTablesExist = Object.values(results).every(result => result === 'OK');

      return {
        status: allTablesExist ? 'success' : 'partial',
        message: allTablesExist ? 'Advanced schema working!' : 'Some tables missing - run SQL setup',
        supabaseUrl: process.env.SUPABASE_URL,
        hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
        tableTests: results,
        hint: allTablesExist ? '🎉 Ready for development!' : '📋 Run supabase_advanced_schema.sql in Supabase Dashboard',
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

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
      // Test basic Supabase connection
      const client = this.supabaseService.supabase;
      
      if (!client) {
        throw new Error('Supabase client not initialized');
      }

      // Try to get current user (this doesn't require tables)
      const { data: { user }, error: authError } = await client.auth.getUser();
      
      // Test database connection with a simple query
      const { data, error } = await client
        .from('information_schema')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5);

      return {
        status: 'success',
        message: 'Supabase connection working',
        supabaseUrl: process.env.SUPABASE_URL,
        hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
        authUser: user ? 'User found' : 'No authenticated user',
        authError: authError?.message || null,
        publicTables: data || [],
        dbError: error?.message || null,
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

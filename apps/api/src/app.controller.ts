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
      const { data, error } = await this.supabaseService.supabase
        .from('users')
        .select('*')
        .limit(1);

      return {
        status: 'success',
        message: 'Supabase connection working',
        data,
        error,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        status: 'error',
        message: 'Supabase connection failed',
        error: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

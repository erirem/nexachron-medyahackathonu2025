import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { UserDataService } from './user-data.service';

@Controller('v1/user-data')
export class UserDataController {
  constructor(private readonly userDataService: UserDataService) {}

  @Post('events')
  async ingestEvent(@Body() body: any) {
    return this.userDataService.ingestEvent(body);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('preferences')
  async getPreferences(@Req() req: any) {
    return this.userDataService.getPreferences(req.user?.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Put('preferences')
  async upsertPreferences(@Req() req: any, @Body() body: any) {
    return this.userDataService.upsertPreferences(req.user?.id, body);
  }
}



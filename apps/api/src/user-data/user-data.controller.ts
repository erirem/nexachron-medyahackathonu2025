import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../modules/auth/guards/supabase-auth.guard';
import { UserDataService } from './user-data.service';

@Controller('v1/user-data')
export class UserDataController {
  constructor(private readonly userDataService: UserDataService) {}

  @Post('events')
  async ingestEvents(@Req() req: any, @Body() body: any) {
    // Accepts single event or { events: [...] }
    return this.userDataService.ingestEvents(body, req?.user?.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('preferences')
  async getPreferences(@Req() req: any) {
    return this.userDataService.getPreferences(req.user?.id, req.accessToken);
  }

  @UseGuards(SupabaseAuthGuard)
  @Put('preferences')
  async upsertPreferences(@Req() req: any, @Body() body: any) {
    return this.userDataService.upsertPreferences(req.user?.id, body, req.accessToken);
  }
}


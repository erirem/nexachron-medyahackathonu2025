import { Body, Controller, Get, Post, Put, Req } from '@nestjs/common';
import { UserDataService } from './user-data.service';

@Controller('v1/user-data')
export class UserDataController {
  constructor(private readonly userDataService: UserDataService) {}

  @Post('events')
  async ingestEvents(@Req() req: any, @Body() body: any) {
    // Accepts single event or { events: [...] }
    return this.userDataService.ingestEvents(body, req?.user?.id);
  }

  @Get('preferences')
  async getPreferences(@Req() req: any) {
    return this.userDataService.getPreferences();
  }

  @Put('preferences')
  async upsertPreferences(@Req() req: any, @Body() body: any) {
    return this.userDataService.upsertPreferences(body);
  }
}


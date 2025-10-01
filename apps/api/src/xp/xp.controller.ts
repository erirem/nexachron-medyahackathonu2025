import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import type { AuthenticatedRequest } from '../auth/supabase-auth.guard';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { XpService } from './xp.service';
import { LogXpEventDto, XpEventRequestType } from './dto/log-xp-event.dto';

@Controller('xp')
@UseGuards(SupabaseAuthGuard)
export class XpController {
  constructor(private readonly xpService: XpService) {}

  @Post('events')
  async logEvent(
    @Req() request: AuthenticatedRequest,
    @Body() body: LogXpEventDto,
  ) {
    const userId = request.user?.id;

    if (!userId) {
      throw new Error('Authenticated user is required for XP events.');
    }

    switch (body.event) {
      case XpEventRequestType.DAILY_LOGIN:
        return this.xpService.handleDailyLogin(userId);
      case XpEventRequestType.POPULAR_NEWS:
        return this.xpService.handlePopularNews(userId, body.metadata);
      case XpEventRequestType.QUIZ_CORRECT:
        return { message: 'Use quiz API to log quiz rewards.' };
      default:
        return { xpDelta: 0, streak: { added: false, current: 0 } };
    }
  }
}

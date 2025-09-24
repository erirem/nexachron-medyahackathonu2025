import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import {
  SupabaseAuthGuard,
  type AuthenticatedRequest,
} from '../auth/supabase-auth.guard';
import { resolveLocale, translate } from '../i18n/i18n';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  async getMe(@Req() request: AuthenticatedRequest) {
    const user = request.user;
    const acceptLanguage = request.headers['accept-language'];
    const locale = resolveLocale(
      Array.isArray(acceptLanguage) ? acceptLanguage[0] : acceptLanguage,
    );

    if (!user) {
      throw new UnauthorizedException(translate(locale, 'errors.unauthorized'));
    }

    return this.usersService.getProfileWithStats(user);
  }
}

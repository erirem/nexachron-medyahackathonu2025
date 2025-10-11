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
} from '../modules/auth/guards/supabase-auth.guard';
import { resolveLocale, translate } from '../i18n/i18n';
import { UsersService, type ProfileWithStats } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  async getMe(@Req() request: AuthenticatedRequest): Promise<ProfileWithStats> {
    const user = request.user;
    const acceptLanguage = request.headers['accept-language'];
    let localeParam: string | undefined;

    if (
      Array.isArray(acceptLanguage) &&
      acceptLanguage.length > 0 &&
      typeof acceptLanguage[0] === 'string'
    ) {
      localeParam = acceptLanguage[0];
    } else if (typeof acceptLanguage === 'string') {
      localeParam = acceptLanguage;
    } else {
      localeParam = undefined;
    }

    const locale = resolveLocale(localeParam);

    if (!user) {
      throw new UnauthorizedException(translate(locale, 'errors.unauthorized'));
    }

    return this.usersService.getProfileWithStats(user);
  }
}

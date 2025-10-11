import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';

import { resolveLocale, translate } from '../i18n/i18n';
import { UsersService, type ProfileWithStats } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() request: any): Promise<ProfileWithStats> {
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

    return this.usersService.getProfileWithStats();
  }
}

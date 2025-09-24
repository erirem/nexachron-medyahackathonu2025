import { Controller, Get, Req, UnauthorizedException, UseGuards } from '@nestjs/common';

import { SupabaseAuthGuard, type AuthenticatedRequest } from '../auth/supabase-auth.guard';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  async getMe(@Req() request: AuthenticatedRequest) {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Supabase kullanıcısı bulunamadı.');
    }

    return this.usersService.getProfileWithStats(user);
  }
}

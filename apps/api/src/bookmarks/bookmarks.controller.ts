import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard, type AuthenticatedRequest } from '../modules/auth/guards/supabase-auth.guard';
import { BookmarksService } from './bookmarks.service';

@UseGuards(SupabaseAuthGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id!;
    const token = req.accessToken!;
    return { success: true, data: await this.bookmarksService.list(userId, token) };
  }

  @Post(':newsId')
  async add(@Req() req: AuthenticatedRequest, @Param('newsId') newsId: string) {
    const userId = req.user?.id!;
    const token = req.accessToken!;
    await this.bookmarksService.add(userId, newsId, token, req.user);
    return { success: true, data: { newsId } };
  }

  @Delete(':newsId')
  async remove(@Req() req: AuthenticatedRequest, @Param('newsId') newsId: string) {
    const userId = req.user?.id!;
    const token = req.accessToken!;
    await this.bookmarksService.remove(userId, newsId, token);
    return { success: true, data: { newsId } };
  }
}



import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  async list(@Req() req: any) {
    return { success: true, data: await this.bookmarksService.list() };
  }

  @Post(':newsId')
  async add(@Req() req: any, @Param('newsId') newsId: string) {
    await this.bookmarksService.add(newsId);
    return { success: true, data: { newsId } };
  }

  @Delete(':newsId')
  async remove(@Req() req: any, @Param('newsId') newsId: string) {
    await this.bookmarksService.remove(newsId);
    return { success: true, data: { newsId } };
  }
}



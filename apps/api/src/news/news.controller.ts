import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async getAllNews(
    @Query('limit') limit?: string,
    @Query('mode') mode?: string,
    @Query('city') city?: string,
  ) {
    const { data, error } = await this.newsService.getAllNews(
      limit ? parseInt(limit) : 20,
      mode,
      city,
    );

    if (error) {
      throw new Error(`Failed to fetch news: ${error.message}`);
    }

    return {
      success: true,
      data,
      count: data?.length || 0,
    };
  }

  @Get('popular')
  async getPopularNews(@Query('limit') limit?: string) {
    const { data, error } = await this.newsService.getPopularNews(
      limit ? parseInt(limit) : 10,
    );

    if (error) {
      throw new Error(`Failed to fetch popular news: ${error.message}`);
    }

    return {
      success: true,
      data,
      count: data?.length || 0,
    };
  }

  @Get('mode/:mode')
  async getNewsByMode(
    @Param('mode') mode: string,
    @Query('limit') limit?: string,
  ) {
    const { data, error } = await this.newsService.getNewsByMode(
      mode.toUpperCase(),
      limit ? parseInt(limit) : 20,
    );

    if (error) {
      throw new Error(`Failed to fetch news by mode: ${error.message}`);
    }

    return {
      success: true,
      data,
      count: data?.length || 0,
      mode: mode.toUpperCase(),
    };
  }

  @Get(':id')
  async getNewsById(@Param('id') id: string) {
    const { data, error } = await this.newsService.getNewsById(id);

    if (error) {
      throw new Error(`Failed to fetch news: ${error.message}`);
    }

    return {
      success: true,
      data,
    };
  }

  @Post(':id/comment')
  async addComment(
    @Param('id') newsId: string,
    @Body() body: { userId: string; comment: string },
  ) {
    const { data, error } = await this.newsService.addComment(
      newsId,
      body.userId,
      body.comment,
    );

    if (error) {
      throw new Error(`Failed to add comment: ${error.message}`);
    }

    return {
      success: true,
      data,
      message: 'Comment added successfully',
    };
  }

  @Post(':id/reaction')
  async addReaction(
    @Param('id') newsId: string,
    @Body() body: { userId: string; emoji: string },
  ) {
    const { data, error } = await this.newsService.addReaction(
      newsId,
      body.userId,
      body.emoji,
    );

    if (error) {
      throw new Error(`Failed to add reaction: ${error.message}`);
    }

    return {
      success: true,
      data,
      message: 'Reaction added successfully',
    };
  }
}

import { Body, Controller, Get, Post, Req, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('v1/recommendations')
export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}

  @Get()
  async getRecommendations(@Req() req: any, @Query() query: any) {
    const body = {
      limit: query.limit ? parseInt(query.limit) : 20,
      window: query.window ? parseInt(query.window) : 30,
    };
    return this.service.getRecommendations(body, req?.user?.id);
  }

  @Post()
  async postRecommendations(@Req() req: any, @Body() body: any) {
    return this.service.getRecommendations(body ?? {}, req?.user?.id);
  }
}



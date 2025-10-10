import { Body, Controller, Post, Req } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('v1/recommendations')
export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}

  @Post()
  async get(@Req() req: any, @Body() body: any) {
    return this.service.getRecommendations(body ?? {}, req?.user?.id);
  }
}



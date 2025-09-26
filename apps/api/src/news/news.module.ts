import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { FeedController } from './feed.controller';
import { NewsService } from './news.service';

@Module({
  controllers: [NewsController, FeedController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}

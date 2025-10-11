/**
 * Refactored News Module
 * Clean, SOLID-compliant news management module
 */

import { Module } from '@nestjs/common';
import { NewsService } from './services/news.service';
import { NewsTestController } from './controllers/news-test.controller';
import { NewsController } from './controllers/news.controller';
import { NewsCategoryController } from './controllers/news-category.controller';
import { NewsMediaController } from './controllers/news-media.controller';
import { NewsRepository } from '../../core/repositories/news.repository';
import { NewsMediaRepository } from '../../core/repositories/news-media.repository';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [
    NewsTestController,
    NewsController,
    NewsCategoryController,
    NewsMediaController,
  ],
  providers: [NewsService, NewsRepository, NewsMediaRepository],
  exports: [NewsService, NewsRepository, NewsMediaRepository],
})
export class NewsModule {}

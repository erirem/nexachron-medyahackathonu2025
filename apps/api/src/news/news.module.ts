import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NewsController } from './news.controller';
import { NewsCategoryController } from './controllers/news-category.controller';
import { NewsService } from './news.service';
import { NewsCategoryService } from './news-category.service';
import { AiCategoryClassificationService } from './services/ai-category-classification.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [HttpModule, SupabaseModule],
  controllers: [NewsController, NewsCategoryController],
  providers: [NewsService, NewsCategoryService, AiCategoryClassificationService],
  exports: [NewsService, NewsCategoryService, AiCategoryClassificationService],
})
export class NewsModule {}

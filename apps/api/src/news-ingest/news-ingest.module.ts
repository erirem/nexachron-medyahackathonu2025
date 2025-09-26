import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { NewsIngestService } from './news-ingest.service';
import { NewsIngestController } from './news-ingest.controller';
import { RssParserService } from './services/rss-parser.service';
import { ContentProcessorService } from './services/content-processor.service';
import { MoodCalculatorService } from './services/mood-calculator.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [HttpModule, ScheduleModule.forRoot(), SupabaseModule],
  controllers: [NewsIngestController],
  providers: [
    NewsIngestService,
    RssParserService,
    ContentProcessorService,
    MoodCalculatorService,
  ],
  exports: [NewsIngestService, MoodCalculatorService],
})
export class NewsIngestModule {}

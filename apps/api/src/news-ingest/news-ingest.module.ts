import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { NewsIngestService } from './news-ingest.service';
import { NewsIngestController } from './news-ingest.controller';
import { RssParserService } from './services/rss-parser.service';
import { ContentProcessorService } from './services/content-processor.service';
import { MoodCalculatorService } from './services/mood-calculator.service';
import { AiSummaryService } from './services/ai-summary.service';
import { MediaStorageService } from './services/media-storage.service';
import { EmotionAnalysisService } from './services/emotion-analysis.service';
import { BatchEmotionUpdaterService } from './services/batch-emotion-updater.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { TTSModule } from '../tts/tts.module';

@Module({
  imports: [HttpModule, ScheduleModule.forRoot(), SupabaseModule, TTSModule],
  controllers: [NewsIngestController],
  providers: [
    NewsIngestService,
    RssParserService,
    ContentProcessorService,
    MoodCalculatorService,
    AiSummaryService,
    MediaStorageService,
    EmotionAnalysisService,
    BatchEmotionUpdaterService,
  ],
  exports: [
    NewsIngestService,
    MoodCalculatorService,
    AiSummaryService,
    MediaStorageService,
    EmotionAnalysisService,
    BatchEmotionUpdaterService,
  ],
})
export class NewsIngestModule {}

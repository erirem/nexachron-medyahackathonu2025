import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ReelsController } from './reels.controller';
import { ReelsService } from './reels.service';
import { ReelGeneratorService } from './services/reel-generator.service';
import { TTSService } from './services/tts.service';
import { VideoComposerService } from './services/video-composer.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { NewsIngestModule } from '../news-ingest/news-ingest.module';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    SupabaseModule,
    NewsIngestModule // For AI summary service
  ],
  controllers: [ReelsController],
  providers: [
    ReelsService,
    ReelGeneratorService,
    TTSService,
    VideoComposerService
  ],
  exports: [
    ReelsService,
    ReelGeneratorService,
    TTSService,
    VideoComposerService
  ]
})
export class ReelsModule {}

/**
 * Media Module
 * Media system module configuration
 */

import { Module } from '@nestjs/common';
import { MediaController } from './controllers/media.controller';
import { TTSController } from './controllers/tts.controller';
import { MediaProcessingController } from './controllers/media-processing.controller';
import { MediaService } from './services/media.service';
import { TTSService } from './services/tts.service';
import { MediaProcessingService } from './services/media-processing.service';
import { MediaRepository } from '../../core/repositories/media.repository';
import { TTSAudioRepository } from '../../core/repositories/tts-audio.repository';
import { MediaProcessingJobRepository } from '../../core/repositories/media-processing-job.repository';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [
    MediaController,
    TTSController,
    MediaProcessingController,
  ],
  providers: [
    MediaService,
    TTSService,
    MediaProcessingService,
    MediaRepository,
    TTSAudioRepository,
    MediaProcessingJobRepository,
  ],
  exports: [
    MediaService,
    TTSService,
    MediaProcessingService,
    MediaRepository,
    TTSAudioRepository,
    MediaProcessingJobRepository,
  ],
})
export class MediaModule {}

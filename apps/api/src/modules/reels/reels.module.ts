/**
 * Reels Module
 * Refactored reels system module configuration
 */

import { Module } from '@nestjs/common';
import { ReelController } from './controllers/reel.controller';
import { ReelGenerationController } from './controllers/reel-generation.controller';
import { ReelTemplateController } from './controllers/reel-template.controller';
import { ReelAssetController } from './controllers/reel-asset.controller';
import { ReelProcessingJobController } from './controllers/reel-processing-job.controller';
import { ReelService } from './services/reel.service';
import { ReelTemplateService } from './services/reel-template.service';
import { ReelAssetService } from './services/reel-asset.service';
import { ReelProcessingJobService } from './services/reel-processing-job.service';
import { ReelRepository } from '../../core/repositories/reel.repository';
import { ReelTemplateRepository } from '../../core/repositories/reel-template.repository';
import { ReelAssetRepository } from '../../core/repositories/reel-asset.repository';
import { ReelProcessingJobRepository } from '../../core/repositories/reel-processing-job.repository';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [
    ReelController,
    ReelGenerationController,
    ReelTemplateController,
    ReelAssetController,
    ReelProcessingJobController,
  ],
  providers: [
    ReelService,
    ReelTemplateService,
    ReelAssetService,
    ReelProcessingJobService,
    ReelRepository,
    ReelTemplateRepository,
    ReelAssetRepository,
    ReelProcessingJobRepository,
  ],
  exports: [
    ReelService,
    ReelTemplateService,
    ReelAssetService,
    ReelProcessingJobService,
    ReelRepository,
    ReelTemplateRepository,
    ReelAssetRepository,
    ReelProcessingJobRepository,
  ],
})
export class ReelsModule {}

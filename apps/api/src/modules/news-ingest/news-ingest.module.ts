/**
 * News Ingest Module
 * NestJS module for news ingestion system
 */

import { Module } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

// Repositories
import { NewsIngestJobRepository } from '../../core/repositories/news-ingest-job.repository';
import { NewsSourceRepository } from '../../core/repositories/news-source.repository';
import { NewsIngestStatisticsRepository } from '../../core/repositories/news-ingest-statistics.repository';

// Services
import { NewsIngestService } from './services/news-ingest.service';
import { NewsSourceService } from './services/news-source.service';
import { NewsIngestStatisticsService } from './services/news-ingest-statistics.service';

// Controllers
import { NewsIngestController } from './controllers/news-ingest.controller';
import { NewsSourceController } from './controllers/news-source.controller';
import { NewsIngestStatisticsController } from './controllers/news-ingest-statistics.controller';

@Module({
  imports: [],
  controllers: [
    NewsIngestController,
    NewsSourceController,
    NewsIngestStatisticsController,
  ],
  providers: [
    // Core services
    SupabaseService,
    
    // Repositories
    NewsIngestJobRepository,
    NewsSourceRepository,
    NewsIngestStatisticsRepository,
    
    // Business services
    NewsIngestService,
    NewsSourceService,
    NewsIngestStatisticsService,
  ],
  exports: [
    // Export services for use in other modules
    NewsIngestService,
    NewsSourceService,
    NewsIngestStatisticsService,
    
    // Export repositories for use in other modules
    NewsIngestJobRepository,
    NewsSourceRepository,
    NewsIngestStatisticsRepository,
  ],
})
export class NewsIngestModule {}

import { Module } from '@nestjs/common';
import { AnalyticsService } from './services/analytics.service';
import { EventIngestionService } from './services/event-ingestion.service';
import { UserPreferenceService } from './services/user-preference.service';
import { AnalyticsController } from './controllers/analytics.controller';
import { EventController } from './controllers/event.controller';
import { PreferenceController } from './controllers/preference.controller';
import { UserEventRepository } from '../../core/repositories/user-event.repository';
import { AnalyticsAggregateRepository } from '../../core/repositories/analytics-aggregate.repository';
import { UserPreferenceRepository } from '../../core/repositories/user-preference.repository';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [
    AnalyticsController,
    EventController,
    PreferenceController,
  ],
  providers: [
    AnalyticsService,
    EventIngestionService,
    UserPreferenceService,
    UserEventRepository,
    AnalyticsAggregateRepository,
    UserPreferenceRepository,
  ],
  exports: [
    AnalyticsService,
    EventIngestionService,
    UserPreferenceService,
    UserEventRepository,
    AnalyticsAggregateRepository,
    UserPreferenceRepository,
  ],
})
export class AnalyticsModule {}

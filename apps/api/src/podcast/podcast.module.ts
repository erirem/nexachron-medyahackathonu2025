import { Module } from '@nestjs/common';
import { PodcastController } from './podcast.controller';
import { PodcastService } from './podcast.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [PodcastController],
  providers: [PodcastService],
  exports: [PodcastService],
})
export class PodcastModule {}

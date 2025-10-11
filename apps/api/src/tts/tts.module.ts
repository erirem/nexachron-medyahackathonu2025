import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TTSController } from './tts.controller';
import { TTSService } from './tts.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { NewsModule } from '../modules/news/news.module';

@Module({
  imports: [HttpModule, SupabaseModule, NewsModule],
  controllers: [TTSController],
  providers: [TTSService],
  exports: [TTSService],
})
export class TTSModule {}

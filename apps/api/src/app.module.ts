import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { NewsModule } from './news/news.module';
import { NewsIngestModule } from './news-ingest/news-ingest.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    NewsModule,
    NewsIngestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

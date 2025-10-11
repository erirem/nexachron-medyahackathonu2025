import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { NewsModule } from './modules/news/news.module';
import { UsersModule } from './modules/users/users.module';
import { GamesModule } from './modules/games/games.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NewsIngestModule } from './modules/news-ingest/news-ingest.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { TTSModule } from './tts/tts.module';
import { ReelsModule } from './modules/reels/reels.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserDataModule } from './user-data/user-data.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { PodcastModule } from './podcast/podcast.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(), // For cron jobs in ReelsService
    SupabaseModule,
    NewsModule,
    UsersModule,
    GamesModule,
    AnalyticsModule,
    NewsIngestModule,
    BookmarksModule,
    GamesModule,
    TTSModule,
    ReelsModule,
    AuthModule,
    UserDataModule,
    RecommendationsModule,
    PodcastModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

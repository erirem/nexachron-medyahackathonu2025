import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { NewsModule } from './modules/news/news.module';
import { UsersModule } from './modules/users/users.module';
import { GamesModule } from './modules/games/games.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NewsIngestModule } from './news-ingest/news-ingest.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { ReelsModule } from './modules/reels/reels.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserDataModule } from './user-data/user-data.module';
import { RecommendationsModule } from './recommendations/recommendations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    NewsModule,
    UsersModule,
    GamesModule,
    AnalyticsModule,
    NewsIngestModule,
    BookmarksModule,
    ReelsModule,
    AuthModule,
    UserDataModule,
    RecommendationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

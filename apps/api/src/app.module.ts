import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { NewsModule } from './news/news.module';
import { UsersModule } from './users/users.module';
import { NewsIngestModule } from './news-ingest/news-ingest.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { UserDataModule } from './user-data/user-data.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { PodcastModule } from './podcast/podcast.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    NewsModule,
    UsersModule,
    NewsIngestModule,
    BookmarksModule,
    UserDataModule,
    RecommendationsModule,
    PodcastModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

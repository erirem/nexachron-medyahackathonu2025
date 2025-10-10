import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { NewsModule } from './news/news.module';
import { UsersModule } from './users/users.module';
import { NewsIngestModule } from './news-ingest/news-ingest.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { GamesModule } from './games/games.module';
import { TTSModule } from './tts/tts.module';
import { ReelsModule } from './reels/reels.module';

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
    GamesModule,
    TTSModule,
    ReelsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

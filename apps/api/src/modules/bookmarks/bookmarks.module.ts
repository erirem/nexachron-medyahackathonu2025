import { Module } from '@nestjs/common';
import { BookmarkController } from './controllers/bookmark.controller';
import { BookmarkAnalyticsController } from './controllers/bookmark-analytics.controller';
import { BookmarkService } from './services/bookmark.service';
import { BookmarkRepository } from '../../core/repositories/bookmark.repository';
import { NewsRepository } from '../../core/repositories/news.repository';
import { UserRepository } from '../../core/repositories/user.repository';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [BookmarkController, BookmarkAnalyticsController],
  providers: [
    BookmarkService,
    BookmarkRepository,
    NewsRepository,
    UserRepository,
  ],
  exports: [BookmarkService, BookmarkRepository],
})
export class BookmarksModule {}

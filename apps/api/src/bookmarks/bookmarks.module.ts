import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';

@Module({
  imports: [SupabaseModule],
  controllers: [BookmarksController],
  providers: [BookmarksService],
})
export class BookmarksModule {}



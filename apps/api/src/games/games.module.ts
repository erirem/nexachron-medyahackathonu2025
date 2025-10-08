import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { QuizGameService } from './services/quiz-game.service';
import { QuestionGenerationService } from './services/question-generation.service';
import { MultiplayerService } from './services/multiplayer.service';
import { GamificationService } from './services/gamification.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { NewsIngestModule } from '../news-ingest/news-ingest.module';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    SupabaseModule,
    NewsIngestModule, // AA haberleri için
  ],
  controllers: [GamesController],
  providers: [
    GamesService,
    QuizGameService,
    QuestionGenerationService,
    MultiplayerService,
    GamificationService,
  ],
  exports: [
    GamesService,
    QuizGameService,
    QuestionGenerationService,
    MultiplayerService,
    GamificationService,
  ],
})
export class GamesModule {}

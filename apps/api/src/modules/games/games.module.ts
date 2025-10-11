import { Module } from '@nestjs/common';
import { GameController } from './controllers/game.controller';
import { GameRoomController } from './controllers/game-room.controller';
import { GameParticipantController } from './controllers/game-participant.controller';
import { GameResultController } from './controllers/game-result.controller';
import { GameService } from './services/game.service';
import { GameRoomService } from './services/game-room.service';
import { GameParticipantService } from './services/game-participant.service';
import { GameResultService } from './services/game-result.service';
import { GameRepository } from '../../core/repositories/game.repository';
import { GameRoomRepository } from '../../core/repositories/game-room.repository';
import { GameParticipantRepository } from '../../core/repositories/game-participant.repository';
import { GameAnswerRepository } from '../../core/repositories/game-answer.repository';
import { GameResultRepository } from '../../core/repositories/game-result.repository';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [
    GameController,
    GameRoomController,
    GameParticipantController,
    GameResultController,
  ],
  providers: [
    GameService,
    GameRoomService,
    GameParticipantService,
    GameResultService,
    GameRepository,
    GameRoomRepository,
    GameParticipantRepository,
    GameAnswerRepository,
    GameResultRepository,
  ],
  exports: [
    GameService,
    GameRoomService,
    GameParticipantService,
    GameResultService,
    GameRepository,
    GameRoomRepository,
    GameParticipantRepository,
    GameAnswerRepository,
    GameResultRepository,
  ],
})
export class GamesModule {}

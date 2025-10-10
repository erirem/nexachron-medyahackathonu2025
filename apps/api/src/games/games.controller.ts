import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { QuizGameService } from './services/quiz-game.service';
import { MultiplayerService } from './services/multiplayer.service';
import { QuestionGenerationService } from './services/question-generation.service';
import { SupabaseAuthGuard, type AuthenticatedRequest } from '../auth/supabase-auth.guard';
import type {
  StartGameRequest,
  AnswerQuestionRequest,
  GameType,
  GameMode,
  QuestionPoolFilter,
} from './dto/game.dto';

@Controller('games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly quizGameService: QuizGameService,
    private readonly multiplayerService: MultiplayerService,
    private readonly questionGenerationService: QuestionGenerationService,
  ) {}

  /**
   * Mevcut oyunları listele
   * GET /api/games
   */
  @Get()
  async getAvailableGames() {
    return this.gamesService.getAvailableGames();
  }

  /**
   * Belirli bir oyun türünün detaylarını getir
   * GET /api/games/:gameType
   */
  @Get(':gameType')
  async getGameDetails(@Param('gameType') gameType: GameType) {
    return this.gamesService.getGameDetails(gameType);
  }

  /**
   * Haber trivia soruları oluştur
   * POST /api/games/generate-news-trivia
   */
  @Post('generate-news-trivia')
  async generateNewsTriviaQuestions() {
    return this.gamesService.generateNewsTriviaQuestions();
  }

  /**
   * Yeni oyun başlat
   * POST /api/games/start
   */
  @UseGuards(SupabaseAuthGuard)
  @Post('start')
  async startGame(
    @Body() startRequest: StartGameRequest,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const game = await this.gamesService.startGame(startRequest, userId);
    return {
      success: true,
      data: game,
    };
  }

  /**
   * Mevcut oyuna katıl (multiplayer)
   * POST /api/games/:gameId/join
   */
  @Post(':gameId/join')
  async joinGame(
    @Param('gameId') gameId: string,
    @Body() body: { playerName: string; password?: string },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.multiplayerService.joinGame(gameId, userId, body.playerName, body.password);
  }

  /**
   * Oyundan ayrıl
   * POST /api/games/:gameId/leave
   */
  @Post(':gameId/leave')
  async leaveGame(@Param('gameId') gameId: string, @Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.multiplayerService.leaveGame(gameId, userId);
  }

  /**
   * Oyunu başlat (oda sahibi)
   * POST /api/games/:gameId/start
   */
  @Post(':gameId/start')
  async startMultiplayerGame(@Param('gameId') gameId: string, @Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.multiplayerService.startGame(gameId, userId);
  }

  /**
   * Soru cevapla
   * POST /api/games/:gameId/answer
   */
  @UseGuards(SupabaseAuthGuard)
  @Post(':gameId/answer')
  async answerQuestion(
    @Param('gameId') gameId: string,
    @Body() answerRequest: AnswerQuestionRequest,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const result = await this.gamesService.answerQuestion(gameId, userId, answerRequest);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Oyunu tamamla
   * POST /api/games/:gameId/complete
   */
  @Post(':gameId/complete')
  async completeGame(@Param('gameId') gameId: string, @Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.gamesService.completeGame(gameId, userId);
  }

  /**
   * Oyun durumunu getir
   * GET /api/games/:gameId/status
   */
  @Get(':gameId/status')
  async getGameStatus(@Param('gameId') gameId: string, @Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.gamesService.getGameStatus(gameId, userId);
  }

  /**
   * Kullanıcının oyun geçmişini getir
   * GET /api/games/history
   */
  @Get('history')
  async getGameHistory(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('gameType') gameType?: GameType,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.gamesService.getGameHistory(userId, { page, limit, gameType });
  }

  /**
   * Liderlik tablosunu getir
   * GET /api/games/leaderboard
   */
  @Get('leaderboard')
  async getLeaderboard(
    @Query('gameType') gameType?: GameType,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' | 'all' = 'weekly',
    @Query('limit') limit: number = 50,
  ) {
    return this.gamesService.getLeaderboard(gameType, period, limit);
  }

  /**
   * Multiplayer odalarını listele
   * GET /api/games/rooms
   */
  @Get('rooms')
  async getGameRooms(
    @Query('gameType') gameType?: GameType,
    @Query('status') status?: string,
    @Query('limit') limit: number = 20,
  ) {
    return this.multiplayerService.getGameRooms(gameType, status, limit);
  }

  /**
   * Yeni multiplayer oda oluştur
   * POST /api/games/rooms
   */
  @Post('rooms')
  async createGameRoom(
    @Body() body: {
      gameType: GameType;
      roomName: string;
      maxPlayers: number;
      isPrivate: boolean;
      password?: string;
      filter?: QuestionPoolFilter;
    },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.multiplayerService.createGameRoom({
      ...body,
      createdBy: userId,
    });
  }

  /**
   * Soru havuzu istatistikleri
   * GET /api/games/questions/stats
   */
  @Get('questions/stats')
  async getQuestionStats() {
    return this.gamesService.getQuestionStats();
  }

  /**
   * Günlük soru havuzu yenileme
   * POST /api/games/questions/refresh
   */
  @Post('questions/refresh')
  async refreshQuestionPool() {
    return this.gamesService.refreshQuestionPool();
  }

  /**
   * Manuel olarak günlük haber trivia soruları oluştur (cron job tetikleme)
   * POST /api/games/trigger-daily-questions
   */
  @Post('trigger-daily-questions')
  async triggerDailyNewsTriviaQuestions() {
    try {
      await this.questionGenerationService.generateDailyNewsTriviaQuestions();
      return {
        success: true,
        message: 'Daily news trivia questions generation triggered successfully'
      };
    } catch (error) {
      throw new HttpException(
        `Failed to trigger daily questions: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Tüm quiz sorularını komple sıfırla (tüm soruları ve cevapları sil)
   * POST /api/games/reset-all-questions
   */
  @Post('reset-all-questions')
  async resetAllQuestions() {
    try {
      const result = await this.questionGenerationService.resetAllQuestions();
      return {
        success: true,
        message: 'All quiz questions and answers have been reset successfully',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        `Failed to reset all questions: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

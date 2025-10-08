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
  @Post('start')
  async startGame(
    @Body() startRequest: StartGameRequest,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.gamesService.startGame(startRequest, userId);
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
  @Post(':gameId/answer')
  async answerQuestion(
    @Param('gameId') gameId: string,
    @Body() answerRequest: AnswerQuestionRequest,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.gamesService.answerQuestion(gameId, userId, answerRequest);
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
}

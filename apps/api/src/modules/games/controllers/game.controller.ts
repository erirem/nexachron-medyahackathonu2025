import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  Req,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GameService } from '../services/game.service';
import { SupabaseAuthGuard } from '../../auth/guards/supabase-auth.guard';
import {
  CreateGameDto,
  UpdateGameDto,
  GameResponseDto,
  GameQueryDto,
  AnswerQuestionDto,
  GameAnswerResponseDto,
  GameResultResponseDto,
  GameStatsDto,
} from '../../../shared/dto/game.dto';
import { createSuccessResponse } from '../../../shared/dto/response.dto';
import { resolveLocale, translate } from '../../../i18n/i18n';
import type { AuthenticatedRequest } from '../../auth/guards/supabase-auth.guard';

@Controller('games')
@UseGuards(SupabaseAuthGuard)
export class GameController {
  private readonly logger = new Logger(GameController.name);

  constructor(private readonly gameService: GameService) {}

  /**
   * Create a new game
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGame(
    @Body() createGameDto: CreateGameDto,
    @Req() req: AuthenticatedRequest,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      return await this.gameService.createGame(createGameDto, userId);
    } catch (error) {
      this.logger.error('Error creating game:', error);
      throw error;
    }
  }

  /**
   * Get all games with optional filters
   */
  @Get()
  async getGames(
    @Query() query: GameQueryDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameService.getGames(query);
    } catch (error) {
      this.logger.error('Error fetching games:', error);
      throw error;
    }
  }

  /**
   * Get a specific game by ID
   */
  @Get(':id')
  async getGameById(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameService.getGameById(id);
    } catch (error) {
      this.logger.error('Error fetching game:', error);
      throw error;
    }
  }

  /**
   * Update a game
   */
  @Put(':id')
  async updateGame(
    @Param('id') id: string,
    @Body() updateGameDto: UpdateGameDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameService.updateGame(id, updateGameDto);
    } catch (error) {
      this.logger.error('Error updating game:', error);
      throw error;
    }
  }

  /**
   * Delete a game
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGame(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<void> {
    const locale = resolveLocale(acceptLanguage);
    try {
      await this.gameService.deleteGame(id);
    } catch (error) {
      this.logger.error('Error deleting game:', error);
      throw error;
    }
  }

  /**
   * Get user's games
   */
  @Get('user/my-games')
  async getUserGames(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      return await this.gameService.getUserGames(userId, limit);
    } catch (error) {
      this.logger.error('Error fetching user games:', error);
      throw error;
    }
  }

  /**
   * Start a game
   */
  @Post(':id/start')
  async startGame(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameService.startGame(id);
    } catch (error) {
      this.logger.error('Error starting game:', error);
      throw error;
    }
  }

  /**
   * Complete a game
   */
  @Post(':id/complete')
  async completeGame(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameService.completeGame(id);
    } catch (error) {
      this.logger.error('Error completing game:', error);
      throw error;
    }
  }

  /**
   * Cancel a game
   */
  @Post(':id/cancel')
  async cancelGame(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameService.cancelGame(id);
    } catch (error) {
      this.logger.error('Error cancelling game:', error);
      throw error;
    }
  }

  /**
   * Get current question
   */
  @Get(':id/current-question')
  async getCurrentQuestion(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameService.getCurrentQuestion(id);
    } catch (error) {
      this.logger.error('Error fetching current question:', error);
      throw error;
    }
  }

  /**
   * Answer a question
   */
  @Post(':id/answer')
  async answerQuestion(
    @Param('id') gameId: string,
    @Body() answerDto: AnswerQuestionDto,
    @Req() req: AuthenticatedRequest,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameAnswerResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      return await this.gameService.answerQuestion(gameId, userId, answerDto);
    } catch (error) {
      this.logger.error('Error answering question:', error);
      throw error;
    }
  }

  /**
   * Get game results
   */
  @Get(':id/results')
  async getGameResults(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResultResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameService.getGameResults(id);
    } catch (error) {
      this.logger.error('Error fetching game results:', error);
      throw error;
    }
  }

  /**
   * Get game leaderboard
   */
  @Get(':id/leaderboard')
  async getGameLeaderboard(
    @Param('id') id: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResultResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameService.getGameLeaderboard(id, limit);
    } catch (error) {
      this.logger.error('Error fetching game leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get game statistics
   */
  @Get(':id/stats')
  async getGameStats(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameService.getGameStats(id);
    } catch (error) {
      this.logger.error('Error fetching game stats:', error);
      throw error;
    }
  }

  /**
   * Get player results
   */
  @Get('user/my-results')
  async getPlayerResults(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResultResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      return await this.gameService.getPlayerResults(userId, limit);
    } catch (error) {
      this.logger.error('Error fetching player results:', error);
      throw error;
    }
  }

  /**
   * Get player statistics
   */
  @Get('user/my-stats')
  async getPlayerStats(
    @Req() req: AuthenticatedRequest,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameStatsDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      return await this.gameService.getPlayerStats(userId);
    } catch (error) {
      this.logger.error('Error fetching player stats:', error);
      throw error;
    }
  }
}

import {
  Controller,
  Get,
  Post,
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
import { GameResultService } from '../services/game-result.service';
import { SupabaseAuthGuard } from '../../auth/guards/supabase-auth.guard';
import {
  GameResultResponseDto,
  GameStatsDto,
} from '../../../shared/dto/game.dto';
import { createSuccessResponse } from '../../../shared/dto/response.dto';
import { resolveLocale, translate } from '../../../i18n/i18n';
import type { AuthenticatedRequest } from '../../auth/guards/supabase-auth.guard';

@Controller('games')
@UseGuards(SupabaseAuthGuard)
export class GameResultController {
  private readonly logger = new Logger(GameResultController.name);

  constructor(private readonly gameResultService: GameResultService) {}

  /**
   * Create a game result
   */
  @Post(':gameId/results')
  @HttpCode(HttpStatus.CREATED)
  async createResult(
    @Param('gameId') gameId: string,
    @Body() body: {
      score: number;
      totalQuestions: number;
      correctAnswers: number;
      timeSpent: number;
      xpEarned: number;
      rank?: number;
    },
    @Req() req: AuthenticatedRequest,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResultResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      const result = await this.gameResultService.createResult(gameId, userId, body);
      return this.gameResultService.mapGameResultEntityToDto(result);
    } catch (error) {
      this.logger.error('Error creating result:', error);
      throw error;
    }
  }

  /**
   * Get game results
   */
  @Get(':gameId/results')
  async getGameResults(
    @Param('gameId') gameId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResultResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameResultService.getGameResults(gameId);
    } catch (error) {
      this.logger.error('Error fetching game results:', error);
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
      return await this.gameResultService.getPlayerResults(userId, limit);
    } catch (error) {
      this.logger.error('Error fetching player results:', error);
      throw error;
    }
  }

  /**
   * Get player game result
   */
  @Get(':gameId/results/player/:playerId')
  async getPlayerGameResult(
    @Param('gameId') gameId: string,
    @Param('playerId') playerId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResultResponseDto | null> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameResultService.getPlayerGameResult(gameId, playerId);
    } catch (error) {
      this.logger.error('Error fetching player game result:', error);
      throw error;
    }
  }

  /**
   * Get game leaderboard
   */
  @Get(':gameId/leaderboard')
  async getGameLeaderboard(
    @Param('gameId') gameId: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResultResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameResultService.getGameLeaderboard(gameId, limit);
    } catch (error) {
      this.logger.error('Error fetching game leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get top players
   */
  @Get('leaderboard/top')
  async getTopPlayers(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResultResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameResultService.getTopPlayers(limit);
    } catch (error) {
      this.logger.error('Error fetching top players:', error);
      throw error;
    }
  }

  /**
   * Get recent results
   */
  @Get('results/recent')
  async getRecentResults(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResultResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameResultService.getRecentResults(limit);
    } catch (error) {
      this.logger.error('Error fetching recent results:', error);
      throw error;
    }
  }

  /**
   * Get best results
   */
  @Get('results/best')
  async getBestResults(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameResultResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameResultService.getBestResults(limit);
    } catch (error) {
      this.logger.error('Error fetching best results:', error);
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
      return await this.gameResultService.getPlayerStats(userId);
    } catch (error) {
      this.logger.error('Error fetching player stats:', error);
      throw error;
    }
  }

  /**
   * Get game statistics
   */
  @Get(':gameId/stats')
  async getGameStats(
    @Param('gameId') gameId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameResultService.getGameStats(gameId);
    } catch (error) {
      this.logger.error('Error fetching game stats:', error);
      throw error;
    }
  }

  /**
   * Get player rank in game
   */
  @Get(':gameId/rank/:playerId')
  async getPlayerRank(
    @Param('gameId') gameId: string,
    @Param('playerId') playerId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<{ rank: number }> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const rank = await this.gameResultService.getPlayerRank(gameId, playerId);
      return { rank };
    } catch (error) {
      this.logger.error('Error getting player rank:', error);
      throw error;
    }
  }

  /**
   * Check if player completed game
   */
  @Get(':gameId/completed/:playerId')
  async hasPlayerCompletedGame(
    @Param('gameId') gameId: string,
    @Param('playerId') playerId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<{ completed: boolean }> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const completed = await this.gameResultService.hasPlayerCompletedGame(gameId, playerId);
      return { completed };
    } catch (error) {
      this.logger.error('Error checking if player completed game:', error);
      throw error;
    }
  }

  /**
   * Get game result count
   */
  @Get(':gameId/results/count')
  async getGameResultCount(
    @Param('gameId') gameId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<{ count: number }> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const count = await this.gameResultService.getGameResultCount(gameId);
      return { count };
    } catch (error) {
      this.logger.error('Error fetching game result count:', error);
      throw error;
    }
  }

  /**
   * Get player result count
   */
  @Get('user/results/count')
  async getPlayerResultCount(
    @Req() req: AuthenticatedRequest,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<{ count: number }> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      const count = await this.gameResultService.getPlayerResultCount(userId);
      return { count };
    } catch (error) {
      this.logger.error('Error fetching player result count:', error);
      throw error;
    }
  }
}

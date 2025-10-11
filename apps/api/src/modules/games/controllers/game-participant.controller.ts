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
import { GameParticipantService } from '../services/game-participant.service';
import { SupabaseAuthGuard } from '../../auth/guards/supabase-auth.guard';
import { createSuccessResponse } from '../../../shared/dto/response.dto';
import { resolveLocale, translate } from '../../../i18n/i18n';
import type { AuthenticatedRequest } from '../../auth/guards/supabase-auth.guard';

@Controller('games/:gameId/participants')
@UseGuards(SupabaseAuthGuard)
export class GameParticipantController {
  private readonly logger = new Logger(GameParticipantController.name);

  constructor(private readonly gameParticipantService: GameParticipantService) {}

  /**
   * Join a game
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async joinGame(
    @Param('gameId') gameId: string,
    @Body() body: { playerName: string; playerAvatar?: string },
    @Req() req: AuthenticatedRequest,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      const participant = await this.gameParticipantService.joinGame(
        gameId,
        userId,
        body.playerName,
        body.playerAvatar,
      );
      return createSuccessResponse(participant);
    } catch (error) {
      this.logger.error('Error joining game:', error);
      throw error;
    }
  }

  /**
   * Leave a game
   */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveGame(
    @Param('gameId') gameId: string,
    @Req() req: AuthenticatedRequest,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<void> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      await this.gameParticipantService.leaveGame(gameId, userId);
    } catch (error) {
      this.logger.error('Error leaving game:', error);
      throw error;
    }
  }

  /**
   * Get game participants
   */
  @Get()
  async getParticipants(
    @Param('gameId') gameId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const participants = await this.gameParticipantService.getParticipants(gameId);
      return participants.map(p => ({
        id: p.id,
        playerId: p.playerId,
        playerName: p.playerName,
        playerAvatar: p.playerAvatar,
        currentScore: p.currentScore,
        currentQuestionIndex: p.currentQuestionIndex,
        isReady: p.isReady,
        joinedAt: p.joinedAt,
      }));
    } catch (error) {
      this.logger.error('Error fetching participants:', error);
      throw error;
    }
  }

  /**
   * Get player's games
   */
  @Get('my-games')
  async getPlayerGames(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      const games = await this.gameParticipantService.getPlayerGames(userId, limit);
      return games.map(g => ({
        id: g.id,
        gameId: g.gameId,
        playerId: g.playerId,
        playerName: g.playerName,
        currentScore: g.currentScore,
        currentQuestionIndex: g.currentQuestionIndex,
        isReady: g.isReady,
        joinedAt: g.joinedAt,
      }));
    } catch (error) {
      this.logger.error('Error fetching player games:', error);
      throw error;
    }
  }

  /**
   * Set ready status
   */
  @Put(':participantId/ready')
  async setReady(
    @Param('participantId') participantId: string,
    @Body() body: { ready: boolean },
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const participant = await this.gameParticipantService.setReady(participantId, body.ready);
      return createSuccessResponse(participant);
    } catch (error) {
      this.logger.error('Error setting ready status:', error);
      throw error;
    }
  }

  /**
   * Update score
   */
  @Put(':participantId/score')
  async updateScore(
    @Param('participantId') participantId: string,
    @Body() body: { score: number },
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const participant = await this.gameParticipantService.updateScore(participantId, body.score);
      return createSuccessResponse(participant);
    } catch (error) {
      this.logger.error('Error updating score:', error);
      throw error;
    }
  }

  /**
   * Add score
   */
  @Post(':participantId/score')
  async addScore(
    @Param('participantId') participantId: string,
    @Body() body: { points: number },
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const participant = await this.gameParticipantService.addScore(participantId, body.points);
      return createSuccessResponse(participant);
    } catch (error) {
      this.logger.error('Error adding score:', error);
      throw error;
    }
  }

  /**
   * Move to next question
   */
  @Put(':participantId/question')
  async moveToNextQuestion(
    @Param('participantId') participantId: string,
    @Body() body: { questionIndex: number },
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const participant = await this.gameParticipantService.moveToNextQuestion(
        participantId,
        body.questionIndex,
      );
      return createSuccessResponse(participant);
    } catch (error) {
      this.logger.error('Error moving to next question:', error);
      throw error;
    }
  }

  /**
   * Reset progress
   */
  @Post(':participantId/reset')
  async resetProgress(
    @Param('participantId') participantId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const participant = await this.gameParticipantService.resetProgress(participantId);
      return createSuccessResponse(participant);
    } catch (error) {
      this.logger.error('Error resetting progress:', error);
      throw error;
    }
  }

  /**
   * Get game leaderboard
   */
  @Get('leaderboard')
  async getLeaderboard(
    @Param('gameId') gameId: string,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const leaderboard = await this.gameParticipantService.getLeaderboard(gameId, limit);
      return leaderboard.map(p => ({
        id: p.id,
        playerId: p.playerId,
        playerName: p.playerName,
        currentScore: p.currentScore,
        currentQuestionIndex: p.currentQuestionIndex,
        isReady: p.isReady,
        rank: p.getRank(leaderboard),
      }));
    } catch (error) {
      this.logger.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get player rank
   */
  @Get('rank/:playerId')
  async getPlayerRank(
    @Param('gameId') gameId: string,
    @Param('playerId') playerId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<{ rank: number }> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const rank = await this.gameParticipantService.getPlayerRank(gameId, playerId);
      return { rank };
    } catch (error) {
      this.logger.error('Error getting player rank:', error);
      throw error;
    }
  }

  /**
   * Get player stats
   */
  @Get('stats/:playerId')
  async getPlayerStats(
    @Param('gameId') gameId: string,
    @Param('playerId') playerId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameParticipantService.getPlayerStats(gameId, playerId);
    } catch (error) {
      this.logger.error('Error fetching player stats:', error);
      throw error;
    }
  }

  /**
   * Get game stats
   */
  @Get('stats')
  async getGameStats(
    @Param('gameId') gameId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameParticipantService.getGameStats(gameId);
    } catch (error) {
      this.logger.error('Error fetching game stats:', error);
      throw error;
    }
  }

  /**
   * Check if player is in game
   */
  @Get('check/:playerId')
  async isPlayerInGame(
    @Param('gameId') gameId: string,
    @Param('playerId') playerId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<{ isInGame: boolean }> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const isInGame = await this.gameParticipantService.isPlayerInGame(gameId, playerId);
      return { isInGame };
    } catch (error) {
      this.logger.error('Error checking if player is in game:', error);
      throw error;
    }
  }

  /**
   * Get participant count
   */
  @Get('count')
  async getParticipantCount(
    @Param('gameId') gameId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<{ count: number }> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const count = await this.gameParticipantService.getParticipantCount(gameId);
      return { count };
    } catch (error) {
      this.logger.error('Error fetching participant count:', error);
      throw error;
    }
  }

  /**
   * Get ready count
   */
  @Get('ready-count')
  async getReadyCount(
    @Param('gameId') gameId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<{ count: number }> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const count = await this.gameParticipantService.getReadyCount(gameId);
      return { count };
    } catch (error) {
      this.logger.error('Error fetching ready count:', error);
      throw error;
    }
  }
}

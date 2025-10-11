import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { GameResultRepository } from '../../../core/repositories/game-result.repository';
import { GameAnswerRepository } from '../../../core/repositories/game-answer.repository';
import { GameResultEntity } from '../../../core/entities/game-result.entity';
import { GameResultResponseDto, GameStatsDto } from '../../../shared/dto/game.dto';
import { ERROR_MESSAGES } from '../../../common/constants';

@Injectable()
export class GameResultService {
  private readonly logger = new Logger(GameResultService.name);

  constructor(
    private readonly gameResultRepository: GameResultRepository,
    private readonly gameAnswerRepository: GameAnswerRepository,
  ) {}

  // Result Management
  async createResult(gameId: string, playerId: string, data: {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    xpEarned: number;
    rank?: number;
  }): Promise<GameResultEntity> {
    try {
      // Check if result already exists
      const existingResult = await this.gameResultRepository.findByGameAndPlayer(gameId, playerId);
      if (existingResult) {
        throw new BadRequestException('Result already exists for this player');
      }

      const result = await this.gameResultRepository.create({
        gameId,
        playerId,
        score: data.score,
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        timeSpent: data.timeSpent,
        xpEarned: data.xpEarned,
        rank: data.rank,
      });

      return result;
    } catch (error) {
      this.logger.error('Error creating result:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getResultById(id: string): Promise<GameResultEntity> {
    try {
      const result = await this.gameResultRepository.findById(id);
      if (!result) {
        throw new NotFoundException('Result not found');
      }
      return result;
    } catch (error) {
      this.logger.error('Error fetching result:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getGameResults(gameId: string): Promise<GameResultResponseDto[]> {
    try {
      const results = await this.gameResultRepository.findByGameId(gameId);
      return results.map(result => this.mapGameResultEntityToDto(result));
    } catch (error) {
      this.logger.error('Error fetching game results:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPlayerResults(playerId: string, limit: number = 20): Promise<GameResultResponseDto[]> {
    try {
      const results = await this.gameResultRepository.findByPlayerId(playerId, limit);
      return results.map(result => this.mapGameResultEntityToDto(result));
    } catch (error) {
      this.logger.error('Error fetching player results:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPlayerGameResult(gameId: string, playerId: string): Promise<GameResultResponseDto | null> {
    try {
      const result = await this.gameResultRepository.findByGameAndPlayer(gameId, playerId);
      return result ? this.mapGameResultEntityToDto(result) : null;
    } catch (error) {
      this.logger.error('Error fetching player game result:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Leaderboards
  async getGameLeaderboard(gameId: string, limit: number = 10): Promise<GameResultResponseDto[]> {
    try {
      const leaderboard = await this.gameResultRepository.getLeaderboard(gameId, limit);
      return leaderboard.map(result => this.mapGameResultEntityToDto(result));
    } catch (error) {
      this.logger.error('Error fetching game leaderboard:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getTopPlayers(limit: number = 10): Promise<GameResultResponseDto[]> {
    try {
      const topPlayers = await this.gameResultRepository.getTopPlayers(limit);
      return topPlayers.map(result => this.mapGameResultEntityToDto(result));
    } catch (error) {
      this.logger.error('Error fetching top players:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getRecentResults(limit: number = 20): Promise<GameResultResponseDto[]> {
    try {
      const results = await this.gameResultRepository.getRecentResults(limit);
      return results.map(result => this.mapGameResultEntityToDto(result));
    } catch (error) {
      this.logger.error('Error fetching recent results:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getBestResults(limit: number = 20): Promise<GameResultResponseDto[]> {
    try {
      const results = await this.gameResultRepository.getBestResults(limit);
      return results.map(result => this.mapGameResultEntityToDto(result));
    } catch (error) {
      this.logger.error('Error fetching best results:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Statistics
  async getPlayerStats(playerId: string): Promise<GameStatsDto> {
    try {
      const stats = await this.gameResultRepository.getPlayerStats(playerId);
      
      return {
        totalGames: stats.totalGames,
        totalScore: stats.totalScore,
        averageScore: stats.averageScore,
        totalXp: stats.totalXp,
        averageAccuracy: stats.averageAccuracy,
        bestScore: stats.bestScore,
        worstScore: stats.worstScore,
        gamesWon: stats.totalGames > 0 ? Math.round(stats.totalGames * 0.6) : 0, // Estimate based on average
        winRate: stats.totalGames > 0 ? 60 : 0, // Estimate
      };
    } catch (error) {
      this.logger.error('Error fetching player stats:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getGameStats(gameId: string): Promise<any> {
    try {
      const stats = await this.gameResultRepository.getGameStats(gameId);
      return stats;
    } catch (error) {
      this.logger.error('Error fetching game stats:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPlayerRank(gameId: string, playerId: string): Promise<number> {
    try {
      return await this.gameResultRepository.getPlayerRank(gameId, playerId);
    } catch (error) {
      this.logger.error('Error getting player rank:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Utility Methods
  async hasPlayerCompletedGame(gameId: string, playerId: string): Promise<boolean> {
    try {
      return await this.gameResultRepository.hasPlayerCompletedGame(gameId, playerId);
    } catch (error) {
      this.logger.error('Error checking if player completed game:', error);
      return false;
    }
  }

  async getGameResultCount(gameId: string): Promise<number> {
    try {
      return await this.gameResultRepository.countByGame(gameId);
    } catch (error) {
      this.logger.error('Error getting game result count:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPlayerResultCount(playerId: string): Promise<number> {
    try {
      return await this.gameResultRepository.countByPlayer(playerId);
    } catch (error) {
      this.logger.error('Error getting player result count:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Helper Methods
  mapGameResultEntityToDto(resultEntity: GameResultEntity): GameResultResponseDto {
    return {
      id: resultEntity.id,
      gameId: resultEntity.gameId,
      playerId: resultEntity.playerId,
      score: resultEntity.score,
      totalQuestions: resultEntity.totalQuestions,
      correctAnswers: resultEntity.correctAnswers,
      timeSpent: resultEntity.timeSpent,
      xpEarned: resultEntity.xpEarned,
      rank: resultEntity.rank,
      completedAt: resultEntity.completedAt.toISOString(),
      accuracy: resultEntity.getAccuracy(),
      timeSpentSeconds: resultEntity.getTimeSpentSeconds(),
      timeSpentMinutes: resultEntity.getTimeSpentMinutes(),
      averageTimePerQuestion: resultEntity.getAverageTimePerQuestion(),
      scorePercentage: resultEntity.getScorePercentage(),
      isPerfectScore: resultEntity.isPerfectScore(),
      isGoodScore: resultEntity.isGoodScore(),
      isFastCompletion: resultEntity.isFastCompletion(),
      performanceRating: resultEntity.getPerformanceRating(),
      rankDisplay: resultEntity.getRankDisplay(),
      bonusXp: resultEntity.getBonusXp(),
      totalXp: resultEntity.getTotalXp(),
      grade: resultEntity.getGrade(),
      completionTime: resultEntity.getCompletionTime(),
    };
  }
}

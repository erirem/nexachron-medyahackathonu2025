import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { GameParticipantRepository } from '../../../core/repositories/game-participant.repository';
import { GameAnswerRepository } from '../../../core/repositories/game-answer.repository';
import { GameResultRepository } from '../../../core/repositories/game-result.repository';
import { GameParticipantEntity } from '../../../core/entities/game-participant.entity';
import { GameAnswerEntity } from '../../../core/entities/game-answer.entity';
import { GameResultEntity } from '../../../core/entities/game-result.entity';
import { ERROR_MESSAGES } from '../../../common/constants';

@Injectable()
export class GameParticipantService {
  private readonly logger = new Logger(GameParticipantService.name);

  constructor(
    private readonly gameParticipantRepository: GameParticipantRepository,
    private readonly gameAnswerRepository: GameAnswerRepository,
    private readonly gameResultRepository: GameResultRepository,
  ) {}

  // Participant Management
  async joinGame(gameId: string, playerId: string, playerName: string, playerAvatar?: string): Promise<GameParticipantEntity> {
    try {
      // Check if player is already in the game
      const existingParticipant = await this.gameParticipantRepository.findByGameAndPlayer(gameId, playerId);
      if (existingParticipant) {
        throw new BadRequestException('Player is already in this game');
      }

      const participant = await this.gameParticipantRepository.create({
        gameId,
        playerId,
        playerName,
        playerAvatar,
      });

      return participant;
    } catch (error) {
      this.logger.error('Error joining game:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async leaveGame(gameId: string, playerId: string): Promise<boolean> {
    try {
      const participant = await this.gameParticipantRepository.findByGameAndPlayer(gameId, playerId);
      if (!participant) {
        throw new NotFoundException('Participant not found');
      }

      return await this.gameParticipantRepository.delete(participant.id);
    } catch (error) {
      this.logger.error('Error leaving game:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getParticipants(gameId: string): Promise<GameParticipantEntity[]> {
    try {
      return await this.gameParticipantRepository.findByGameId(gameId);
    } catch (error) {
      this.logger.error('Error fetching participants:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPlayerGames(playerId: string, limit: number = 20): Promise<GameParticipantEntity[]> {
    try {
      return await this.gameParticipantRepository.findByPlayerId(playerId, limit);
    } catch (error) {
      this.logger.error('Error fetching player games:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Participant Control
  async setReady(participantId: string, ready: boolean): Promise<GameParticipantEntity> {
    try {
      const participant = await this.gameParticipantRepository.findById(participantId);
      if (!participant) {
        throw new NotFoundException('Participant not found');
      }

      return await this.gameParticipantRepository.setReady(participantId, ready);
    } catch (error) {
      this.logger.error('Error setting ready status:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async updateScore(participantId: string, score: number): Promise<GameParticipantEntity> {
    try {
      const participant = await this.gameParticipantRepository.findById(participantId);
      if (!participant) {
        throw new NotFoundException('Participant not found');
      }

      return await this.gameParticipantRepository.updateScore(participantId, score);
    } catch (error) {
      this.logger.error('Error updating score:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async addScore(participantId: string, points: number): Promise<GameParticipantEntity> {
    try {
      const participant = await this.gameParticipantRepository.findById(participantId);
      if (!participant) {
        throw new NotFoundException('Participant not found');
      }

      return await this.gameParticipantRepository.addScore(participantId, points);
    } catch (error) {
      this.logger.error('Error adding score:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async moveToNextQuestion(participantId: string, questionIndex: number): Promise<GameParticipantEntity> {
    try {
      const participant = await this.gameParticipantRepository.findById(participantId);
      if (!participant) {
        throw new NotFoundException('Participant not found');
      }

      return await this.gameParticipantRepository.moveToNextQuestion(participantId, questionIndex);
    } catch (error) {
      this.logger.error('Error moving to next question:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async resetProgress(participantId: string): Promise<GameParticipantEntity> {
    try {
      const participant = await this.gameParticipantRepository.findById(participantId);
      if (!participant) {
        throw new NotFoundException('Participant not found');
      }

      return await this.gameParticipantRepository.resetProgress(participantId);
    } catch (error) {
      this.logger.error('Error resetting progress:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Leaderboard and Statistics
  async getLeaderboard(gameId: string, limit: number = 10): Promise<GameParticipantEntity[]> {
    try {
      return await this.gameParticipantRepository.getLeaderboard(gameId, limit);
    } catch (error) {
      this.logger.error('Error fetching leaderboard:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPlayerRank(gameId: string, playerId: string): Promise<number> {
    try {
      return await this.gameParticipantRepository.getPlayerRank(gameId, playerId);
    } catch (error) {
      this.logger.error('Error getting player rank:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPlayerStats(gameId: string, playerId: string): Promise<any> {
    try {
      const participant = await this.gameParticipantRepository.findByGameAndPlayer(gameId, playerId);
      if (!participant) {
        throw new NotFoundException('Participant not found');
      }

      const answers = await this.gameAnswerRepository.findByGameAndPlayer(gameId, playerId);
      const result = await this.gameResultRepository.findByGameAndPlayer(gameId, playerId);

      return {
        participant: {
          id: participant.id,
          playerId: participant.playerId,
          playerName: participant.playerName,
          currentScore: participant.currentScore,
          currentQuestionIndex: participant.currentQuestionIndex,
          isReady: participant.isReady,
          joinedAt: participant.joinedAt,
        },
        answers: {
          total: answers.length,
          correct: answers.filter(a => a.isCorrect).length,
          incorrect: answers.filter(a => !a.isCorrect).length,
          accuracy: answers.length > 0 ? (answers.filter(a => a.isCorrect).length / answers.length) * 100 : 0,
          totalXp: answers.reduce((sum, a) => sum + a.xpEarned, 0),
        },
        result: result ? {
          score: result.score,
          rank: result.rank,
          accuracy: result.getAccuracy(),
          totalXp: result.getTotalXp(),
          grade: result.getGrade(),
        } : null,
      };
    } catch (error) {
      this.logger.error('Error getting player stats:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getGameStats(gameId: string): Promise<any> {
    try {
      const participants = await this.gameParticipantRepository.findByGameId(gameId);
      const readyParticipants = await this.gameParticipantRepository.findReadyParticipants(gameId);
      const leaderboard = await this.gameParticipantRepository.getLeaderboard(gameId, 10);

      return {
        totalParticipants: participants.length,
        readyParticipants: readyParticipants.length,
        notReadyParticipants: participants.length - readyParticipants.length,
        leaderboard: leaderboard.map(p => ({
          playerId: p.playerId,
          playerName: p.playerName,
          score: p.currentScore,
          questionIndex: p.currentQuestionIndex,
        })),
        averageScore: participants.length > 0 ? participants.reduce((sum, p) => sum + p.currentScore, 0) / participants.length : 0,
        highestScore: participants.length > 0 ? Math.max(...participants.map(p => p.currentScore)) : 0,
        lowestScore: participants.length > 0 ? Math.min(...participants.map(p => p.currentScore)) : 0,
      };
    } catch (error) {
      this.logger.error('Error getting game stats:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Utility Methods
  async isPlayerInGame(gameId: string, playerId: string): Promise<boolean> {
    try {
      return await this.gameParticipantRepository.isPlayerInGame(gameId, playerId);
    } catch (error) {
      this.logger.error('Error checking if player is in game:', error);
      return false;
    }
  }

  async getParticipantCount(gameId: string): Promise<number> {
    try {
      return await this.gameParticipantRepository.countByGame(gameId);
    } catch (error) {
      this.logger.error('Error getting participant count:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getReadyCount(gameId: string): Promise<number> {
    try {
      return await this.gameParticipantRepository.countReadyByGame(gameId);
    } catch (error) {
      this.logger.error('Error getting ready count:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPlayerGameCount(playerId: string): Promise<number> {
    try {
      return await this.gameParticipantRepository.countByPlayer(playerId);
    } catch (error) {
      this.logger.error('Error getting player game count:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

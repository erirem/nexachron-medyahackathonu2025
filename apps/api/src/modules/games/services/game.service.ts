import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { GameRepository } from '../../../core/repositories/game.repository';
import { GameRoomRepository } from '../../../core/repositories/game-room.repository';
import { GameParticipantRepository } from '../../../core/repositories/game-participant.repository';
import { GameAnswerRepository } from '../../../core/repositories/game-answer.repository';
import { GameResultRepository } from '../../../core/repositories/game-result.repository';
import { GameEntity, GameType, GameMode, GameStatus } from '../../../core/entities/game.entity';
import { GameRoomEntity } from '../../../core/entities/game-room.entity';
import { GameParticipantEntity } from '../../../core/entities/game-participant.entity';
import { GameAnswerEntity } from '../../../core/entities/game-answer.entity';
import { GameResultEntity } from '../../../core/entities/game-result.entity';
import {
  CreateGameDto,
  UpdateGameDto,
  GameResponseDto,
  GameQueryDto,
  AnswerQuestionDto,
  GameAnswerResponseDto,
  GameResultResponseDto,
} from '../../../shared/dto/game.dto';
import { ERROR_MESSAGES } from '../../../common/constants';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    private readonly gameRepository: GameRepository,
    private readonly gameRoomRepository: GameRoomRepository,
    private readonly gameParticipantRepository: GameParticipantRepository,
    private readonly gameAnswerRepository: GameAnswerRepository,
    private readonly gameResultRepository: GameResultRepository,
  ) {}

  // Game Management
  async createGame(createGameDto: CreateGameDto, userId: string): Promise<GameResponseDto> {
    try {
      const gameEntity = await this.gameRepository.create({
        type: createGameDto.type,
        mode: createGameDto.mode,
        questions: createGameDto.questions,
        timeLimit: createGameDto.timeLimit,
        createdBy: userId,
      });

      return this.mapGameEntityToDto(gameEntity);
    } catch (error) {
      this.logger.error('Error creating game:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getGameById(id: string): Promise<GameResponseDto> {
    const gameEntity = await this.gameRepository.findById(id);
    if (!gameEntity) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }
    return this.mapGameEntityToDto(gameEntity);
  }

  async updateGame(id: string, updateGameDto: UpdateGameDto): Promise<GameResponseDto> {
    const gameEntity = await this.gameRepository.update(id, updateGameDto);
    return this.mapGameEntityToDto(gameEntity);
  }

  async deleteGame(id: string): Promise<boolean> {
    return this.gameRepository.delete(id);
  }

  async getGames(query: GameQueryDto): Promise<GameResponseDto[]> {
    try {
      let games: GameEntity[] = [];

      if (query.type) {
        games = await this.gameRepository.findByType(query.type, query.pageSize ?? 20);
      } else if (query.status) {
        games = await this.gameRepository.findByStatus(query.status, query.pageSize ?? 20);
      } else if (query.mode === GameMode.SINGLE_PLAYER) {
        games = await this.gameRepository.findActiveGames(query.pageSize ?? 20);
      } else {
        games = await this.gameRepository.findActiveGames(query.pageSize ?? 20);
      }

      return games.map(game => this.mapGameEntityToDto(game));
    } catch (error) {
      this.logger.error('Error fetching games:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserGames(userId: string, limit: number = 20): Promise<GameResponseDto[]> {
    const games = await this.gameRepository.findByUser(userId, limit);
    return games.map(game => this.mapGameEntityToDto(game));
  }

  // Game Control
  async startGame(id: string): Promise<GameResponseDto> {
    const gameEntity = await this.gameRepository.findById(id);
    if (!gameEntity) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    if (!gameEntity.canStart()) {
      throw new BadRequestException('Game cannot be started');
    }

    const startedGame = await this.gameRepository.startGame(id);
    return this.mapGameEntityToDto(startedGame);
  }

  async completeGame(id: string): Promise<GameResponseDto> {
    const gameEntity = await this.gameRepository.findById(id);
    if (!gameEntity) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    const completedGame = await this.gameRepository.completeGame(id);
    return this.mapGameEntityToDto(completedGame);
  }

  async cancelGame(id: string): Promise<GameResponseDto> {
    const gameEntity = await this.gameRepository.findById(id);
    if (!gameEntity) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    const cancelledGame = await this.gameRepository.cancelGame(id);
    return this.mapGameEntityToDto(cancelledGame);
  }

  async moveToNextQuestion(id: string, questionIndex: number): Promise<GameResponseDto> {
    const gameEntity = await this.gameRepository.findById(id);
    if (!gameEntity) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    const updatedGame = await this.gameRepository.moveToNextQuestion(id, questionIndex);
    return this.mapGameEntityToDto(updatedGame);
  }

  // Question Management
  async getCurrentQuestion(gameId: string): Promise<any> {
    const gameEntity = await this.gameRepository.findById(gameId);
    if (!gameEntity) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    const currentQuestion = gameEntity.getCurrentQuestion();
    if (!currentQuestion) {
      throw new BadRequestException('No current question available');
    }

    return currentQuestion;
  }

  async answerQuestion(gameId: string, playerId: string, answerDto: AnswerQuestionDto): Promise<GameAnswerResponseDto> {
    try {
      const gameEntity = await this.gameRepository.findById(gameId);
      if (!gameEntity) {
        throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
      }

      if (!gameEntity.canAnswer()) {
        throw new BadRequestException('Game is not in a state to accept answers');
      }

      const currentQuestion = gameEntity.getCurrentQuestion();
      if (!currentQuestion) {
        throw new BadRequestException('No current question available');
      }

      const isCorrect = currentQuestion.correctAnswer === answerDto.answer;
      const xpEarned = isCorrect ? 10 : 0; // Basic XP calculation

      const answerEntity = await this.gameAnswerRepository.create({
        gameId,
        playerId,
        questionId: answerDto.questionId,
        answer: answerDto.answer,
        isCorrect,
        timeSpent: answerDto.timeSpent,
        xpEarned,
      });

      return this.mapGameAnswerEntityToDto(answerEntity);
    } catch (error) {
      this.logger.error('Error answering question:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Results and Statistics
  async getGameResults(gameId: string): Promise<GameResultResponseDto[]> {
    const results = await this.gameResultRepository.findByGameId(gameId);
    return results.map(result => this.mapGameResultEntityToDto(result));
  }

  async getPlayerResults(playerId: string, limit: number = 20): Promise<GameResultResponseDto[]> {
    const results = await this.gameResultRepository.findByPlayerId(playerId, limit);
    return results.map(result => this.mapGameResultEntityToDto(result));
  }

  async getGameLeaderboard(gameId: string, limit: number = 10): Promise<GameResultResponseDto[]> {
    const leaderboard = await this.gameResultRepository.getLeaderboard(gameId, limit);
    return leaderboard.map(result => this.mapGameResultEntityToDto(result));
  }

  async getPlayerStats(playerId: string): Promise<any> {
    return this.gameResultRepository.getPlayerStats(playerId);
  }

  async getGameStats(gameId: string): Promise<any> {
    return this.gameResultRepository.getGameStats(gameId);
  }

  // Helper Methods
  private mapGameEntityToDto(gameEntity: GameEntity): GameResponseDto {
    return {
      id: gameEntity.id,
      type: gameEntity.type,
      mode: gameEntity.mode,
      status: gameEntity.status,
      questions: gameEntity.questions,
      currentQuestionIndex: gameEntity.currentQuestionIndex,
      timeLimit: gameEntity.timeLimit,
      createdBy: gameEntity.createdBy,
      createdAt: gameEntity.createdAt.toISOString(),
      startedAt: gameEntity.startedAt?.toISOString(),
      completedAt: gameEntity.completedAt?.toISOString(),
      totalQuestions: gameEntity.getTotalQuestions(),
      progress: gameEntity.getProgress(),
      isActive: gameEntity.isActive(),
      isCompleted: gameEntity.isCompleted(),
      canStart: gameEntity.canStart(),
      canAnswer: gameEntity.canAnswer(),
      isLastQuestion: gameEntity.isLastQuestion(),
      remainingQuestions: gameEntity.getRemainingQuestions(),
    };
  }

  private mapGameAnswerEntityToDto(answerEntity: GameAnswerEntity): GameAnswerResponseDto {
    return {
      id: answerEntity.id,
      gameId: answerEntity.gameId,
      playerId: answerEntity.playerId,
      questionId: answerEntity.questionId,
      answer: answerEntity.answer,
      isCorrect: answerEntity.isCorrect,
      timeSpent: answerEntity.timeSpent,
      xpEarned: answerEntity.xpEarned,
      createdAt: answerEntity.createdAt.toISOString(),
      timeSpentSeconds: answerEntity.getTimeSpentSeconds(),
      wasAnsweredQuickly: answerEntity.wasAnsweredQuickly(),
      speedBonus: answerEntity.getSpeedBonus(),
      totalXp: answerEntity.getTotalXp(),
      accuracy: answerEntity.getAccuracy(),
      efficiency: answerEntity.getEfficiency(),
    };
  }

  private mapGameResultEntityToDto(resultEntity: GameResultEntity): GameResultResponseDto {
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

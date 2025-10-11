import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { GameAnswerEntity, CreateGameAnswerData, UpdateGameAnswerData } from '../entities/game-answer.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class GameAnswerRepository extends BaseRepository<GameAnswerEntity> {
  private readonly tableName = DATABASE_TABLES.GAME_ANSWERS;

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findById(id: string): Promise<GameAnswerEntity | null> {
    if (!this.validateUuid(id)) {
      return null;
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        this.handleError(error, 'findById');
      }
      return data ? new GameAnswerEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateGameAnswerData): Promise<GameAnswerEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          game_id: data.gameId,
          player_id: data.playerId,
          question_id: data.questionId,
          answer: data.answer,
          is_correct: data.isCorrect,
          time_spent: data.timeSpent,
          xp_earned: data.xpEarned || 0,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }
      return new GameAnswerEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: UpdateGameAnswerData): Promise<GameAnswerEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid answer ID');
    }
    try {
      const updateData: any = {};
      if (data.answer !== undefined) updateData.answer = data.answer;
      if (data.isCorrect !== undefined) updateData.is_correct = data.isCorrect;
      if (data.timeSpent !== undefined) updateData.time_spent = data.timeSpent;
      if (data.xpEarned !== undefined) updateData.xp_earned = data.xpEarned;

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }
      return new GameAnswerEntity(result);
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!this.validateUuid(id)) {
      return false;
    }
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        this.handleError(error, 'delete');
      }
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async findByGameId(gameId: string): Promise<GameAnswerEntity[]> {
    if (!this.validateUuid(gameId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: true });

      if (error) {
        this.handleError(error, 'findByGameId');
      }
      return data ? data.map(row => new GameAnswerEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByGameId');
    }
  }

  async findByPlayerId(playerId: string, limit: number = 50): Promise<GameAnswerEntity[]> {
    if (!this.validateUuid(playerId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByPlayerId');
      }
      return data ? data.map(row => new GameAnswerEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByPlayerId');
    }
  }

  async findByGameAndPlayer(gameId: string, playerId: string): Promise<GameAnswerEntity[]> {
    if (!this.validateUuid(gameId) || !this.validateUuid(playerId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('game_id', gameId)
        .eq('player_id', playerId)
        .order('created_at', { ascending: true });

      if (error) {
        this.handleError(error, 'findByGameAndPlayer');
      }
      return data ? data.map(row => new GameAnswerEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByGameAndPlayer');
    }
  }

  async findByQuestionId(questionId: string): Promise<GameAnswerEntity[]> {
    if (!this.validateUuid(questionId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('question_id', questionId)
        .order('created_at', { ascending: true });

      if (error) {
        this.handleError(error, 'findByQuestionId');
      }
      return data ? data.map(row => new GameAnswerEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByQuestionId');
    }
  }

  async findCorrectAnswers(gameId: string): Promise<GameAnswerEntity[]> {
    if (!this.validateUuid(gameId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('game_id', gameId)
        .eq('is_correct', true)
        .order('created_at', { ascending: true });

      if (error) {
        this.handleError(error, 'findCorrectAnswers');
      }
      return data ? data.map(row => new GameAnswerEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findCorrectAnswers');
    }
  }

  async findIncorrectAnswers(gameId: string): Promise<GameAnswerEntity[]> {
    if (!this.validateUuid(gameId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('game_id', gameId)
        .eq('is_correct', false)
        .order('created_at', { ascending: true });

      if (error) {
        this.handleError(error, 'findIncorrectAnswers');
      }
      return data ? data.map(row => new GameAnswerEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findIncorrectAnswers');
    }
  }

  async getPlayerStats(gameId: string, playerId: string): Promise<{
    totalAnswers: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
    totalXp: number;
    averageTime: number;
  }> {
    const answers = await this.findByGameAndPlayer(gameId, playerId);
    
    const totalAnswers = answers.length;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const incorrectAnswers = totalAnswers - correctAnswers;
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    const totalXp = answers.reduce((sum, a) => sum + a.xpEarned, 0);
    const averageTime = totalAnswers > 0 ? answers.reduce((sum, a) => sum + a.timeSpent, 0) / totalAnswers : 0;

    return {
      totalAnswers,
      correctAnswers,
      incorrectAnswers,
      accuracy,
      totalXp,
      averageTime,
    };
  }

  async getGameStats(gameId: string): Promise<{
    totalAnswers: number;
    correctAnswers: number;
    incorrectAnswers: number;
    averageAccuracy: number;
    totalXpAwarded: number;
    averageTime: number;
  }> {
    const answers = await this.findByGameId(gameId);
    
    const totalAnswers = answers.length;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const incorrectAnswers = totalAnswers - correctAnswers;
    const averageAccuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    const totalXpAwarded = answers.reduce((sum, a) => sum + a.xpEarned, 0);
    const averageTime = totalAnswers > 0 ? answers.reduce((sum, a) => sum + a.timeSpent, 0) / totalAnswers : 0;

    return {
      totalAnswers,
      correctAnswers,
      incorrectAnswers,
      averageAccuracy,
      totalXpAwarded,
      averageTime,
    };
  }

  async countByGame(gameId: string): Promise<number> {
    if (!this.validateUuid(gameId)) {
      return 0;
    }
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('id', { count: 'exact', head: true })
        .eq('game_id', gameId);

      if (error) {
        this.handleError(error, 'countByGame');
      }
      return count ?? 0;
    } catch (error) {
      this.handleError(error, 'countByGame');
    }
  }

  async countByPlayer(playerId: string): Promise<number> {
    if (!this.validateUuid(playerId)) {
      return 0;
    }
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('id', { count: 'exact', head: true })
        .eq('player_id', playerId);

      if (error) {
        this.handleError(error, 'countByPlayer');
      }
      return count ?? 0;
    } catch (error) {
      this.handleError(error, 'countByPlayer');
    }
  }

  async countCorrectByPlayer(playerId: string): Promise<number> {
    if (!this.validateUuid(playerId)) {
      return 0;
    }
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('id', { count: 'exact', head: true })
        .eq('player_id', playerId)
        .eq('is_correct', true);

      if (error) {
        this.handleError(error, 'countCorrectByPlayer');
      }
      return count ?? 0;
    } catch (error) {
      this.handleError(error, 'countCorrectByPlayer');
    }
  }

  async getPlayerAccuracy(playerId: string): Promise<number> {
    const total = await this.countByPlayer(playerId);
    const correct = await this.countCorrectByPlayer(playerId);
    return total > 0 ? (correct / total) * 100 : 0;
  }

  async hasPlayerAnswered(gameId: string, playerId: string, questionId: string): Promise<boolean> {
    if (!this.validateUuid(gameId) || !this.validateUuid(playerId) || !this.validateUuid(questionId)) {
      return false;
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('id')
        .eq('game_id', gameId)
        .eq('player_id', playerId)
        .eq('question_id', questionId)
        .maybeSingle();

      if (error) {
        this.handleError(error, 'hasPlayerAnswered');
      }
      return data !== null;
    } catch (error) {
      this.handleError(error, 'hasPlayerAnswered');
    }
  }
}

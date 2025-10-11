import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { GameResultEntity, CreateGameResultData, UpdateGameResultData } from '../entities/game-result.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class GameResultRepository extends BaseRepository<GameResultEntity> {
  private readonly tableName = DATABASE_TABLES.GAME_RESULTS;

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findById(id: string): Promise<GameResultEntity | null> {
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
      return data ? new GameResultEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateGameResultData): Promise<GameResultEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          game_id: data.gameId,
          player_id: data.playerId,
          score: data.score,
          total_questions: data.totalQuestions,
          correct_answers: data.correctAnswers,
          time_spent: data.timeSpent,
          xp_earned: data.xpEarned,
          rank: data.rank,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }
      return new GameResultEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: UpdateGameResultData): Promise<GameResultEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid result ID');
    }
    try {
      const updateData: any = {};
      if (data.score !== undefined) updateData.score = data.score;
      if (data.correctAnswers !== undefined) updateData.correct_answers = data.correctAnswers;
      if (data.timeSpent !== undefined) updateData.time_spent = data.timeSpent;
      if (data.xpEarned !== undefined) updateData.xp_earned = data.xpEarned;
      if (data.rank !== undefined) updateData.rank = data.rank;
      if (data.completedAt !== undefined) updateData.completed_at = data.completedAt.toISOString();

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }
      return new GameResultEntity(result);
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

  async findByGameId(gameId: string): Promise<GameResultEntity[]> {
    if (!this.validateUuid(gameId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('game_id', gameId)
        .order('score', { ascending: false });

      if (error) {
        this.handleError(error, 'findByGameId');
      }
      return data ? data.map(row => new GameResultEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByGameId');
    }
  }

  async findByPlayerId(playerId: string, limit: number = 50): Promise<GameResultEntity[]> {
    if (!this.validateUuid(playerId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('player_id', playerId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByPlayerId');
      }
      return data ? data.map(row => new GameResultEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByPlayerId');
    }
  }

  async findByGameAndPlayer(gameId: string, playerId: string): Promise<GameResultEntity | null> {
    if (!this.validateUuid(gameId) || !this.validateUuid(playerId)) {
      return null;
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('game_id', gameId)
        .eq('player_id', playerId)
        .maybeSingle();

      if (error) {
        this.handleError(error, 'findByGameAndPlayer');
      }
      return data ? new GameResultEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findByGameAndPlayer');
    }
  }

  async getLeaderboard(gameId: string, limit: number = 10): Promise<GameResultEntity[]> {
    if (!this.validateUuid(gameId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('game_id', gameId)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getLeaderboard');
      }
      return data ? data.map(row => new GameResultEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getLeaderboard');
    }
  }

  async getTopPlayers(limit: number = 10): Promise<GameResultEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getTopPlayers');
      }
      return data ? data.map(row => new GameResultEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getTopPlayers');
    }
  }

  async getPlayerRank(gameId: string, playerId: string): Promise<number> {
    const leaderboard = await this.getLeaderboard(gameId);
    const playerIndex = leaderboard.findIndex(r => r.playerId === playerId);
    return playerIndex >= 0 ? playerIndex + 1 : 0;
  }

  async getPlayerStats(playerId: string): Promise<{
    totalGames: number;
    totalScore: number;
    averageScore: number;
    totalXp: number;
    averageAccuracy: number;
    bestScore: number;
    worstScore: number;
  }> {
    const results = await this.findByPlayerId(playerId, 1000); // Get all results
    
    const totalGames = results.length;
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const averageScore = totalGames > 0 ? totalScore / totalGames : 0;
    const totalXp = results.reduce((sum, r) => sum + r.xpEarned, 0);
    const averageAccuracy = totalGames > 0 ? results.reduce((sum, r) => sum + r.getAccuracy(), 0) / totalGames : 0;
    const bestScore = totalGames > 0 ? Math.max(...results.map(r => r.score)) : 0;
    const worstScore = totalGames > 0 ? Math.min(...results.map(r => r.score)) : 0;

    return {
      totalGames,
      totalScore,
      averageScore,
      totalXp,
      averageAccuracy,
      bestScore,
      worstScore,
    };
  }

  async getGameStats(gameId: string): Promise<{
    totalPlayers: number;
    averageScore: number;
    averageAccuracy: number;
    totalXpAwarded: number;
    bestScore: number;
    worstScore: number;
  }> {
    const results = await this.findByGameId(gameId);
    
    const totalPlayers = results.length;
    const averageScore = totalPlayers > 0 ? results.reduce((sum, r) => sum + r.score, 0) / totalPlayers : 0;
    const averageAccuracy = totalPlayers > 0 ? results.reduce((sum, r) => sum + r.getAccuracy(), 0) / totalPlayers : 0;
    const totalXpAwarded = results.reduce((sum, r) => sum + r.xpEarned, 0);
    const bestScore = totalPlayers > 0 ? Math.max(...results.map(r => r.score)) : 0;
    const worstScore = totalPlayers > 0 ? Math.min(...results.map(r => r.score)) : 0;

    return {
      totalPlayers,
      averageScore,
      averageAccuracy,
      totalXpAwarded,
      bestScore,
      worstScore,
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

  async getRecentResults(limit: number = 20): Promise<GameResultEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getRecentResults');
      }
      return data ? data.map(row => new GameResultEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getRecentResults');
    }
  }

  async getBestResults(limit: number = 20): Promise<GameResultEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getBestResults');
      }
      return data ? data.map(row => new GameResultEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getBestResults');
    }
  }

  async hasPlayerCompletedGame(gameId: string, playerId: string): Promise<boolean> {
    const result = await this.findByGameAndPlayer(gameId, playerId);
    return result !== null;
  }
}

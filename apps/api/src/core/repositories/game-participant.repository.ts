import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { GameParticipantEntity, CreateGameParticipantData, UpdateGameParticipantData } from '../entities/game-participant.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class GameParticipantRepository extends BaseRepository<GameParticipantEntity> {
  private readonly tableName = DATABASE_TABLES.GAME_PARTICIPANTS;

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findById(id: string): Promise<GameParticipantEntity | null> {
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
      return data ? new GameParticipantEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateGameParticipantData): Promise<GameParticipantEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          game_id: data.gameId,
          player_id: data.playerId,
          player_name: data.playerName,
          player_avatar: data.playerAvatar,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }
      return new GameParticipantEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: UpdateGameParticipantData): Promise<GameParticipantEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid participant ID');
    }
    try {
      const updateData: any = {};
      if (data.playerName !== undefined) updateData.player_name = data.playerName;
      if (data.playerAvatar !== undefined) updateData.player_avatar = data.playerAvatar;
      if (data.isReady !== undefined) updateData.is_ready = data.isReady;
      if (data.currentScore !== undefined) updateData.current_score = data.currentScore;
      if (data.currentQuestionIndex !== undefined) updateData.current_question_index = data.currentQuestionIndex;

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }
      return new GameParticipantEntity(result);
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

  async findByGameId(gameId: string): Promise<GameParticipantEntity[]> {
    if (!this.validateUuid(gameId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('game_id', gameId)
        .order('joined_at', { ascending: true });

      if (error) {
        this.handleError(error, 'findByGameId');
      }
      return data ? data.map(row => new GameParticipantEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByGameId');
    }
  }

  async findByPlayerId(playerId: string, limit: number = 20): Promise<GameParticipantEntity[]> {
    if (!this.validateUuid(playerId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('player_id', playerId)
        .order('joined_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByPlayerId');
      }
      return data ? data.map(row => new GameParticipantEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByPlayerId');
    }
  }

  async findByGameAndPlayer(gameId: string, playerId: string): Promise<GameParticipantEntity | null> {
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
      return data ? new GameParticipantEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findByGameAndPlayer');
    }
  }

  async findReadyParticipants(gameId: string): Promise<GameParticipantEntity[]> {
    if (!this.validateUuid(gameId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('game_id', gameId)
        .eq('is_ready', true)
        .order('joined_at', { ascending: true });

      if (error) {
        this.handleError(error, 'findReadyParticipants');
      }
      return data ? data.map(row => new GameParticipantEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findReadyParticipants');
    }
  }

  async getLeaderboard(gameId: string, limit: number = 10): Promise<GameParticipantEntity[]> {
    if (!this.validateUuid(gameId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('game_id', gameId)
        .order('current_score', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getLeaderboard');
      }
      return data ? data.map(row => new GameParticipantEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getLeaderboard');
    }
  }

  async setReady(participantId: string, ready: boolean): Promise<GameParticipantEntity> {
    return this.update(participantId, { isReady: ready });
  }

  async updateScore(participantId: string, score: number): Promise<GameParticipantEntity> {
    return this.update(participantId, { currentScore: score });
  }

  async addScore(participantId: string, points: number): Promise<GameParticipantEntity> {
    const participant = await this.findById(participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }
    return this.update(participantId, { currentScore: participant.currentScore + points });
  }

  async moveToNextQuestion(participantId: string, questionIndex: number): Promise<GameParticipantEntity> {
    return this.update(participantId, { currentQuestionIndex: questionIndex });
  }

  async resetProgress(participantId: string): Promise<GameParticipantEntity> {
    return this.update(participantId, {
      currentScore: 0,
      currentQuestionIndex: 0,
      isReady: false,
    });
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

  async countReadyByGame(gameId: string): Promise<number> {
    if (!this.validateUuid(gameId)) {
      return 0;
    }
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('id', { count: 'exact', head: true })
        .eq('game_id', gameId)
        .eq('is_ready', true);

      if (error) {
        this.handleError(error, 'countReadyByGame');
      }
      return count ?? 0;
    } catch (error) {
      this.handleError(error, 'countReadyByGame');
    }
  }

  async isPlayerInGame(gameId: string, playerId: string): Promise<boolean> {
    const participant = await this.findByGameAndPlayer(gameId, playerId);
    return participant !== null;
  }

  async getPlayerRank(gameId: string, playerId: string): Promise<number> {
    const leaderboard = await this.getLeaderboard(gameId);
    const playerIndex = leaderboard.findIndex(p => p.playerId === playerId);
    return playerIndex >= 0 ? playerIndex + 1 : 0;
  }
}

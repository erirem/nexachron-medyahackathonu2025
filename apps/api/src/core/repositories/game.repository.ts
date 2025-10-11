import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { GameEntity, CreateGameData, UpdateGameData, GameType, GameMode, GameStatus } from '../entities/game.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class GameRepository extends BaseRepository<GameEntity> {
  private readonly tableName = DATABASE_TABLES.GAMES;

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findById(id: string): Promise<GameEntity | null> {
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
      return data ? new GameEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateGameData): Promise<GameEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          type: data.type,
          mode: data.mode,
          questions: data.questions,
          time_limit: data.timeLimit,
          created_by: data.createdBy,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }
      return new GameEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: UpdateGameData): Promise<GameEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid game ID');
    }
    try {
      const updateData: any = {};
      if (data.status !== undefined) updateData.status = data.status;
      if (data.currentQuestionIndex !== undefined) updateData.current_question_index = data.currentQuestionIndex;
      if (data.startedAt !== undefined) updateData.started_at = data.startedAt.toISOString();
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
      return new GameEntity(result);
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

  async findByUser(userId: string, limit: number = 20): Promise<GameEntity[]> {
    if (!this.validateUuid(userId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByUser');
      }
      return data ? data.map(row => new GameEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByUser');
    }
  }

  async findByType(type: GameType, limit: number = 20): Promise<GameEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByType');
      }
      return data ? data.map(row => new GameEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByType');
    }
  }

  async findByStatus(status: GameStatus, limit: number = 20): Promise<GameEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findByStatus');
      }
      return data ? data.map(row => new GameEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByStatus');
    }
  }

  async findActiveGames(limit: number = 20): Promise<GameEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('status', [GameStatus.WAITING, GameStatus.IN_PROGRESS])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findActiveGames');
      }
      return data ? data.map(row => new GameEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findActiveGames');
    }
  }

  async findCompletedGames(limit: number = 20): Promise<GameEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', GameStatus.COMPLETED)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findCompletedGames');
      }
      return data ? data.map(row => new GameEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findCompletedGames');
    }
  }

  async countByUser(userId: string): Promise<number> {
    if (!this.validateUuid(userId)) {
      return 0;
    }
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('id', { count: 'exact', head: true })
        .eq('created_by', userId);

      if (error) {
        this.handleError(error, 'countByUser');
      }
      return count ?? 0;
    } catch (error) {
      this.handleError(error, 'countByUser');
    }
  }

  async countByType(type: GameType): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('id', { count: 'exact', head: true })
        .eq('type', type);

      if (error) {
        this.handleError(error, 'countByType');
      }
      return count ?? 0;
    } catch (error) {
      this.handleError(error, 'countByType');
    }
  }

  async startGame(id: string): Promise<GameEntity> {
    return this.update(id, {
      status: GameStatus.IN_PROGRESS,
      startedAt: new Date(),
    });
  }

  async completeGame(id: string): Promise<GameEntity> {
    return this.update(id, {
      status: GameStatus.COMPLETED,
      completedAt: new Date(),
    });
  }

  async cancelGame(id: string): Promise<GameEntity> {
    return this.update(id, {
      status: GameStatus.CANCELLED,
      completedAt: new Date(),
    });
  }

  async moveToNextQuestion(id: string, questionIndex: number): Promise<GameEntity> {
    return this.update(id, {
      currentQuestionIndex: questionIndex,
    });
  }
}

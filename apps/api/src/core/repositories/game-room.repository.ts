import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { GameRoomEntity, CreateGameRoomData, UpdateGameRoomData, GameRoomStatus } from '../entities/game-room.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class GameRoomRepository extends BaseRepository<GameRoomEntity> {
  private readonly tableName = DATABASE_TABLES.GAME_ROOMS;

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findById(id: string): Promise<GameRoomEntity | null> {
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
      return data ? new GameRoomEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateGameRoomData): Promise<GameRoomEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          game_id: data.gameId,
          name: data.name,
          game_type: data.gameType,
          max_players: data.maxPlayers,
          is_private: data.isPrivate,
          password: data.password,
          created_by: data.createdBy,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }
      return new GameRoomEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: UpdateGameRoomData): Promise<GameRoomEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid game room ID');
    }
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.maxPlayers !== undefined) updateData.max_players = data.maxPlayers;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.password !== undefined) updateData.password = data.password;
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
      return new GameRoomEntity(result);
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

  async findByGameId(gameId: string): Promise<GameRoomEntity[]> {
    if (!this.validateUuid(gameId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (error) {
        this.handleError(error, 'findByGameId');
      }
      return data ? data.map(row => new GameRoomEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByGameId');
    }
  }

  async findByUser(userId: string, limit: number = 20): Promise<GameRoomEntity[]> {
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
      return data ? data.map(row => new GameRoomEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findByUser');
    }
  }

  async findAvailableRooms(limit: number = 20): Promise<GameRoomEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', GameRoomStatus.WAITING)
        .eq('is_private', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findAvailableRooms');
      }
      return data ? data.map(row => new GameRoomEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findAvailableRooms');
    }
  }

  async findPublicRooms(limit: number = 20): Promise<GameRoomEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('is_private', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findPublicRooms');
      }
      return data ? data.map(row => new GameRoomEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findPublicRooms');
    }
  }

  async findPrivateRooms(userId: string, limit: number = 20): Promise<GameRoomEntity[]> {
    if (!this.validateUuid(userId)) {
      return [];
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('is_private', true)
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'findPrivateRooms');
      }
      return data ? data.map(row => new GameRoomEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'findPrivateRooms');
    }
  }

  async addPlayer(roomId: string, playerId: string): Promise<GameRoomEntity> {
    if (!this.validateUuid(roomId) || !this.validateUuid(playerId)) {
      throw new Error('Invalid room or player ID');
    }
    try {
      // First get current players
      const room = await this.findById(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      const currentPlayers = room.currentPlayers;
      if (currentPlayers.includes(playerId)) {
        return room; // Player already in room
      }

      const updatedPlayers = [...currentPlayers, playerId];

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update({ current_players: updatedPlayers })
        .eq('id', roomId)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'addPlayer');
      }
      return new GameRoomEntity(result);
    } catch (error) {
      this.handleError(error, 'addPlayer');
    }
  }

  async removePlayer(roomId: string, playerId: string): Promise<GameRoomEntity> {
    if (!this.validateUuid(roomId) || !this.validateUuid(playerId)) {
      throw new Error('Invalid room or player ID');
    }
    try {
      // First get current players
      const room = await this.findById(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      const currentPlayers = room.currentPlayers;
      const updatedPlayers = currentPlayers.filter(id => id !== playerId);

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update({ current_players: updatedPlayers })
        .eq('id', roomId)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'removePlayer');
      }
      return new GameRoomEntity(result);
    } catch (error) {
      this.handleError(error, 'removePlayer');
    }
  }

  async startRoom(roomId: string): Promise<GameRoomEntity> {
    return this.update(roomId, {
      status: GameRoomStatus.IN_PROGRESS,
      startedAt: new Date(),
    });
  }

  async completeRoom(roomId: string): Promise<GameRoomEntity> {
    return this.update(roomId, {
      status: GameRoomStatus.COMPLETED,
      completedAt: new Date(),
    });
  }

  async cancelRoom(roomId: string): Promise<GameRoomEntity> {
    return this.update(roomId, {
      status: GameRoomStatus.CANCELLED,
      completedAt: new Date(),
    });
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

  async countAvailable(): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('id', { count: 'exact', head: true })
        .eq('status', GameRoomStatus.WAITING)
        .eq('is_private', false);

      if (error) {
        this.handleError(error, 'countAvailable');
      }
      return count ?? 0;
    } catch (error) {
      this.handleError(error, 'countAvailable');
    }
  }
}

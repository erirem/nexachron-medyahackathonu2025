import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import {
  GameRoom,
  GameParticipant,
  GameStatus,
  GameType,
  QuestionPoolFilter,
} from '../dto/game.dto';

interface CreateGameRoomRequest {
  gameType: GameType;
  roomName: string;
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
  filter?: QuestionPoolFilter;
  createdBy: string;
}

@Injectable()
export class MultiplayerService {
  private readonly logger = new Logger(MultiplayerService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Yeni oyun odası oluştur
   */
  async createGameRoom(request: CreateGameRoomRequest): Promise<GameRoom> {
    this.logger.log(`Creating game room: ${request.roomName}`);

    try {
      const room: GameRoom = {
        id: crypto.randomUUID(),
        gameId: crypto.randomUUID(), // Oyun ID'si
        name: request.roomName,
        maxPlayers: request.maxPlayers,
        currentPlayers: [request.createdBy],
        isPrivate: request.isPrivate,
        password: request.password,
        status: GameStatus.WAITING,
        createdAt: new Date(),
        createdBy: request.createdBy,
      };

      // Veritabanına kaydet
      await this.saveGameRoom(room);

      // Oda sahibini katılımcı olarak ekle
      await this.addParticipant(room.id, request.createdBy, 'Room Owner');

      return room;
    } catch (error) {
      this.logger.error(`Failed to create game room: ${error.message}`);
      throw error;
    }
  }

  /**
   * Oyuna katıl
   */
  async joinGame(
    gameId: string,
    userId: string,
    playerName: string,
    password?: string,
  ): Promise<GameParticipant> {
    this.logger.log(`User ${userId} joining game ${gameId}`);

    try {
      // Oyun odasını getir
      const room = await this.getGameRoom(gameId);
      if (!room) {
        throw new Error('Game room not found');
      }

      // Şifre kontrolü
      if (room.isPrivate && room.password !== password) {
        throw new Error('Invalid password');
      }

      // Oda dolu mu kontrol et
      if (room.currentPlayers.length >= room.maxPlayers) {
        throw new Error('Game room is full');
      }

      // Oyun başlamış mı kontrol et
      if (room.status !== GameStatus.WAITING) {
        throw new Error('Game has already started');
      }

      // Kullanıcı zaten katılmış mı kontrol et
      if (room.currentPlayers.includes(userId)) {
        throw new Error('User is already in the game');
      }

      // Katılımcı ekle
      const participant = await this.addParticipant(gameId, userId, playerName);

      // Oda listesini güncelle
      await this.updateRoomPlayers(gameId, [...room.currentPlayers, userId]);

      return participant;
    } catch (error) {
      this.logger.error(`Failed to join game: ${error.message}`);
      throw error;
    }
  }

  /**
   * Oyundan ayrıl
   */
  async leaveGame(gameId: string, userId: string): Promise<void> {
    this.logger.log(`User ${userId} leaving game ${gameId}`);

    try {
      // Katılımcıyı kaldır
      await this.removeParticipant(gameId, userId);

      // Oda sahibi ayrılıyorsa odayı kapat
      const room = await this.getGameRoom(gameId);
      if (room && room.createdBy === userId) {
        await this.closeGameRoom(gameId);
      } else {
        // Oda listesini güncelle
        const updatedPlayers = room?.currentPlayers.filter(id => id !== userId) || [];
        await this.updateRoomPlayers(gameId, updatedPlayers);
      }
    } catch (error) {
      this.logger.error(`Failed to leave game: ${error.message}`);
      throw error;
    }
  }

  /**
   * Oyunu başlat (oda sahibi)
   */
  async startGame(gameId: string, userId: string): Promise<void> {
    this.logger.log(`Starting game ${gameId} by user ${userId}`);

    try {
      const room = await this.getGameRoom(gameId);
      if (!room) {
        throw new Error('Game room not found');
      }

      // Sadece oda sahibi başlatabilir
      if (room.createdBy !== userId) {
        throw new Error('Only room owner can start the game');
      }

      // En az 2 oyuncu olmalı
      if (room.currentPlayers.length < 2) {
        throw new Error('At least 2 players required to start the game');
      }

      // Oyunu başlat
      await this.updateRoomStatus(gameId, GameStatus.IN_PROGRESS);

      // Tüm katılımcıları hazır olarak işaretle
      await this.setAllParticipantsReady(gameId);

      this.logger.log(`Game ${gameId} started successfully`);
    } catch (error) {
      this.logger.error(`Failed to start game: ${error.message}`);
      throw error;
    }
  }

  /**
   * Oyun odalarını listele
   */
  async getGameRooms(
    gameType?: GameType,
    status?: string,
    limit: number = 20,
  ) {
    try {
      let query = this.supabaseService.supabase
        .from('game_rooms')
        .select(`
          *,
          participants:game_participants(count)
        `)
        .eq('is_private', false); // Sadece public odalar

      if (gameType) {
        query = query.eq('game_type', gameType);
      }

      if (status) {
        query = query.eq('status', status);
      }

      query = query
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch game rooms: ${error.message}`);
      }

      return data.map(room => ({
        ...room,
        currentPlayerCount: room.participants?.[0]?.count || 0,
      }));
    } catch (error) {
      this.logger.error(`Failed to get game rooms: ${error.message}`);
      throw error;
    }
  }

  /**
   * Oyun durumunu getir
   */
  async getGameStatus(gameId: string) {
    try {
      const room = await this.getGameRoom(gameId);
      if (!room) {
        throw new Error('Game room not found');
      }

      const participants = await this.getGameParticipants(gameId);

      return {
        room,
        participants,
        canStart: room.currentPlayers.length >= 2 && room.status === GameStatus.WAITING,
        isOwner: false, // Bu kullanıcı ID'si ile kontrol edilmeli
      };
    } catch (error) {
      this.logger.error(`Failed to get game status: ${error.message}`);
      throw error;
    }
  }

  // Private helper methods

  private async saveGameRoom(room: GameRoom) {
    const { error } = await this.supabaseService.supabase
      .from('game_rooms')
      .insert({
        id: room.id,
        game_id: room.gameId,
        name: room.name,
        game_type: 'quiz', // Şimdilik sadece quiz
        max_players: room.maxPlayers,
        current_players: room.currentPlayers,
        is_private: room.isPrivate,
        password: room.password,
        status: room.status,
        created_by: room.createdBy,
        created_at: room.createdAt.toISOString(),
        started_at: room.startedAt?.toISOString(),
        completed_at: room.completedAt?.toISOString(),
      });

    if (error) {
      throw new Error(`Failed to save game room: ${error.message}`);
    }
  }

  private async getGameRoom(gameId: string): Promise<GameRoom | null> {
    const { data, error } = await this.supabaseService.supabase
      .from('game_rooms')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch game room: ${error.message}`);
    }

    return {
      id: data.id,
      gameId: data.game_id,
      name: data.name,
      maxPlayers: data.max_players,
      currentPlayers: data.current_players,
      isPrivate: data.is_private,
      password: data.password,
      status: data.status,
      createdAt: new Date(data.created_at),
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdBy: data.created_by,
    };
  }

  private async addParticipant(
    gameId: string,
    userId: string,
    playerName: string,
  ): Promise<GameParticipant> {
    const participant: GameParticipant = {
      id: crypto.randomUUID(),
      gameId,
      playerId: userId,
      playerName,
      joinedAt: new Date(),
      isReady: false,
      currentScore: 0,
      currentQuestionIndex: 0,
    };

    const { error } = await this.supabaseService.supabase
      .from('game_participants')
      .insert({
        id: participant.id,
        game_id: gameId,
        player_id: userId,
        player_name: playerName,
        joined_at: participant.joinedAt.toISOString(),
        is_ready: participant.isReady,
        current_score: participant.currentScore,
        current_question_index: participant.currentQuestionIndex,
      });

    if (error) {
      throw new Error(`Failed to add participant: ${error.message}`);
    }

    return participant;
  }

  private async removeParticipant(gameId: string, userId: string) {
    const { error } = await this.supabaseService.supabase
      .from('game_participants')
      .delete()
      .eq('game_id', gameId)
      .eq('player_id', userId);

    if (error) {
      throw new Error(`Failed to remove participant: ${error.message}`);
    }
  }

  private async getGameParticipants(gameId: string): Promise<GameParticipant[]> {
    const { data, error } = await this.supabaseService.supabase
      .from('game_participants')
      .select('*')
      .eq('game_id', gameId);

    if (error) {
      throw new Error(`Failed to fetch participants: ${error.message}`);
    }

    return data.map(p => ({
      id: p.id,
      gameId: p.game_id,
      playerId: p.player_id,
      playerName: p.player_name,
      playerAvatar: p.player_avatar,
      joinedAt: new Date(p.joined_at),
      isReady: p.is_ready,
      currentScore: p.current_score,
      currentQuestionIndex: p.current_question_index,
    }));
  }

  private async updateRoomPlayers(gameId: string, players: string[]) {
    const { error } = await this.supabaseService.supabase
      .from('game_rooms')
      .update({ current_players: players })
      .eq('id', gameId);

    if (error) {
      throw new Error(`Failed to update room players: ${error.message}`);
    }
  }

  private async updateRoomStatus(gameId: string, status: GameStatus) {
    const updateData: any = { status };
    
    if (status === GameStatus.IN_PROGRESS) {
      updateData.started_at = new Date().toISOString();
    } else if (status === GameStatus.COMPLETED) {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await this.supabaseService.supabase
      .from('game_rooms')
      .update(updateData)
      .eq('id', gameId);

    if (error) {
      throw new Error(`Failed to update room status: ${error.message}`);
    }
  }

  private async setAllParticipantsReady(gameId: string) {
    const { error } = await this.supabaseService.supabase
      .from('game_participants')
      .update({ is_ready: true })
      .eq('game_id', gameId);

    if (error) {
      throw new Error(`Failed to set participants ready: ${error.message}`);
    }
  }

  private async closeGameRoom(gameId: string) {
    await this.updateRoomStatus(gameId, GameStatus.CANCELLED);
    
    // Tüm katılımcıları kaldır
    const { error } = await this.supabaseService.supabase
      .from('game_participants')
      .delete()
      .eq('game_id', gameId);

    if (error) {
      this.logger.error(`Failed to remove participants: ${error.message}`);
    }
  }
}

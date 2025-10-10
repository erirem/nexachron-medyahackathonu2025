import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { GamesService } from '../games.service';
import {
  GameRoom,
  GameParticipant,
  GameStatus,
  GameType,
  GameMode,
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

  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Yeni oyun odası oluştur
   */
  async createGameRoom(request: CreateGameRoomRequest): Promise<GameRoom> {
    this.logger.log(`Creating game room: ${request.roomName}`);

    try {
      // Önce oyunu oluştur (sorular dahil)
      const gameId = crypto.randomUUID();
      await this.createGameWithQuestions(gameId, request.gameType, request.createdBy, request.filter);

      const room: GameRoom = {
        id: crypto.randomUUID(),
        gameId: gameId,
        name: request.roomName,
        maxPlayers: request.maxPlayers,
        currentPlayers: [], // Boş başlat, WebSocket join'de eklenecek
        isPrivate: request.isPrivate,
        password: request.password,
        status: GameStatus.WAITING,
        createdAt: new Date(),
        createdBy: request.createdBy,
      };

      // Veritabanına kaydet
      await this.saveGameRoom(room);

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
    roomId: string,
    userId: string,
    playerName: string,
    password?: string,
  ): Promise<GameParticipant> {
    this.logger.log(`User ${userId} joining game ${roomId}`);

    try {
      // Oyun odasını getir
      const room = await this.getGameRoom(roomId);
      if (!room) {
        throw new Error('Game room not found');
      }

      // Room'dan gameId'yi al
      const gameId = room.gameId;

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
        // Kullanıcı zaten odada, mevcut participant'ı getir
        const existingParticipant = await this.getParticipant(gameId, userId);
        if (existingParticipant) {
          return existingParticipant;
        }
      }

      // Katılımcı ekle
      const participant = await this.addParticipant(gameId, userId, playerName);

      // Oda listesini güncelle
      await this.updateRoomPlayers(roomId, [...room.currentPlayers, userId]);

      return participant;
    } catch (error) {
      this.logger.error(`Failed to join game: ${error.message}`);
      throw error;
    }
  }

  /**
   * Oyundan ayrıl
   */
  async leaveGame(roomId: string, userId: string): Promise<void> {
    this.logger.log(`User ${userId} leaving game ${roomId}`);

    try {
      // Oyun odasını getir
      const room = await this.getGameRoom(roomId);
      if (!room) {
        throw new Error('Game room not found');
      }

      // Room'dan gameId'yi al
      const gameId = room.gameId;

      // Katılımcıyı kaldır
      await this.removeParticipant(gameId, userId);

      // Oda sahibi ayrılıyorsa odayı kapat
      if (room.createdBy === userId) {
        await this.closeGameRoom(roomId);
      } else {
        // Oda listesini güncelle
        const updatedPlayers = room.currentPlayers.filter(id => id !== userId);
        await this.updateRoomPlayers(roomId, updatedPlayers);
      }
    } catch (error) {
      this.logger.error(`Failed to leave game: ${error.message}`);
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

  /**
   * Oda detaylarını getir
   */
  async getGameRoomDetails(roomId: string) {
    try {
      const room = await this.getGameRoom(roomId);
      if (!room) {
        throw new Error('Game room not found');
      }

      const participants = await this.getGameParticipants(roomId);

      return {
        room,
        participants,
      };
    } catch (error) {
      this.logger.error(`Failed to get game room details: ${error.message}`);
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

  /**
   * Oyunu başlat
   */
  async startGame(roomId: string, userId: string) {
    this.logger.log(`Starting game in room ${roomId} by user ${userId}`);

    try {
      // Oda detaylarını getir
      const room = await this.getGameRoom(roomId);
      if (!room) {
        throw new Error('Game room not found');
      }

      // Sadece oda sahibi oyunu başlatabilir
      if (room.createdBy !== userId) {
        throw new Error('Only room owner can start the game');
      }

      // Oyunu başlat
      await this.updateRoomStatus(roomId, GameStatus.IN_PROGRESS);

      // Oyun detaylarını getir (GamesService ile oluşturulan game)
      const game = await this.getGame(room.gameId);

      return game;
    } catch (error) {
      this.logger.error(`Failed to start game: ${error.message}`);
      throw error;
    }
  }

  /**
   * Soru cevapla
   */
  async answerQuestion(
    roomId: string,
    userId: string,
    answerRequest: { questionId: string; answer: string; timeSpent: number },
  ) {
    this.logger.log(`User ${userId} answering question in room ${roomId}`);

    try {
      // Oda detaylarını getir
      const room = await this.getGameRoom(roomId);
      if (!room) {
        throw new Error('Game room not found');
      }

      // Oyun detaylarını getir
      const game = await this.getGame(room.gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      // Cevabı işle
      const isCorrect = game.questions[game.currentQuestionIndex]?.correctAnswer === answerRequest.answer;
      
      // Skor güncelle
      if (isCorrect) {
        await this.updateParticipantScore(roomId, userId, 1);
      }

      return {
        isCorrect,
        score: isCorrect ? 1 : 0,
        questionId: answerRequest.questionId,
      };
    } catch (error) {
      this.logger.error(`Failed to process answer: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sonraki soruya geç
   */
  async nextQuestion(roomId: string, userId: string) {
    this.logger.log(`Moving to next question in room ${roomId}`);

    try {
      // Oda detaylarını getir
      const room = await this.getGameRoom(roomId);
      if (!room) {
        throw new Error('Game room not found');
      }

      // Oyun detaylarını getir
      const game = await this.getGame(room.gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      // Sonraki soruya geç
      const nextQuestionIndex = game.currentQuestionIndex + 1;
      
      if (nextQuestionIndex >= game.questions.length) {
        // Oyun tamamlandı
        await this.updateRoomStatus(roomId, GameStatus.COMPLETED);
        return {
          isComplete: true,
          currentQuestionIndex: nextQuestionIndex,
        };
      }

      // Oyun durumunu güncelle
      await this.updateGameQuestionIndex(room.gameId, nextQuestionIndex);

      return {
        isComplete: false,
        currentQuestionIndex: nextQuestionIndex,
        question: game.questions[nextQuestionIndex],
      };
    } catch (error) {
      this.logger.error(`Failed to move to next question: ${error.message}`);
      throw error;
    }
  }

  /**
   * Oyunu tamamla
   */
  async completeGame(roomId: string, userId: string) {
    this.logger.log(`Completing game in room ${roomId}`);

    try {
      // Oda detaylarını getir
      const room = await this.getGameRoom(roomId);
      if (!room) {
        throw new Error('Game room not found');
      }

      // Oyunu tamamla
      await this.updateRoomStatus(roomId, GameStatus.COMPLETED);

      // Final skorları getir
      const participants = await this.getGameParticipants(roomId);
      const sortedParticipants = participants.sort((a, b) => b.currentScore - a.currentScore);

      return {
        participants: sortedParticipants,
        winner: sortedParticipants[0],
        totalQuestions: room.gameId ? (await this.getGame(room.gameId))?.questions.length || 0 : 0,
      };
    } catch (error) {
      this.logger.error(`Failed to complete game: ${error.message}`);
      throw error;
    }
  }

  private async updateParticipantScore(roomId: string, userId: string, scoreIncrement: number) {
    // First get the game_id from the room
    const room = await this.getGameRoom(roomId);
    if (!room) {
      throw new Error('Game room not found');
    }

    // First get current score
    const { data: participant, error: fetchError } = await this.supabaseService.supabase
      .from('game_participants')
      .select('current_score')
      .eq('game_id', room.gameId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch participant: ${fetchError.message}`);
    }

    // Update with new score
    const { error } = await this.supabaseService.supabase
      .from('game_participants')
      .update({ 
        current_score: (participant.current_score || 0) + scoreIncrement,
        updated_at: new Date().toISOString(),
      })
      .eq('game_id', room.gameId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to update participant score: ${error.message}`);
    }
  }

  private async updateGameQuestionIndex(gameId: string, questionIndex: number) {
    const { error } = await this.supabaseService.supabase
      .from('games')
      .update({ 
        current_question_index: questionIndex,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gameId);

    if (error) {
      throw new Error(`Failed to update game question index: ${error.message}`);
    }
  }

  private async getGameParticipants(roomId: string) {
    // First get the game_id from the room
    const room = await this.getGameRoom(roomId);
    if (!room) {
      throw new Error('Game room not found');
    }

    const { data, error } = await this.supabaseService.supabase
      .from('game_participants')
      .select('*')
      .eq('game_id', room.gameId);

    if (error) {
      throw new Error(`Failed to get game participants: ${error.message}`);
    }

    return data || [];
  }

  private async getGame(gameId: string) {
    const { data, error } = await this.supabaseService.supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error) {
      throw new Error(`Failed to get game: ${error.message}`);
    }

    return data;
  }

  private async getParticipant(gameId: string, userId: string) {
    const { data, error } = await this.supabaseService.supabase
      .from('game_participants')
      .select('*')
      .eq('game_id', gameId)
      .eq('player_id', userId)
      .single();

    if (error) {
      return null; // Participant not found
    }

    return {
      id: data.id,
      gameId: data.game_id,
      playerId: data.player_id,
      playerName: data.player_name,
      playerAvatar: data.player_avatar,
      joinedAt: new Date(data.joined_at),
      isReady: data.is_ready,
      currentScore: data.current_score,
      currentQuestionIndex: data.current_question_index,
    };
  }

  private async createGameWithQuestions(
    gameId: string, 
    gameType: GameType, 
    createdBy: string, 
    filter?: QuestionPoolFilter
  ) {
    // Soruları oluştur (GamesService'deki logic'i kopyala)
    const questions = await this.generateQuestions(gameType, filter);

    const { error } = await this.supabaseService.supabase
      .from('games')
      .insert({
        id: gameId,
        type: gameType,
        mode: 'multiplayer',
        status: 'waiting',
        questions: questions,
        current_question_index: 0,
        time_limit: 300, // 5 dakika
        created_by: createdBy,
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to create game: ${error.message}`);
    }
  }

  private async generateQuestions(gameType: GameType, filter?: QuestionPoolFilter) {
    // Bu fonksiyon GamesService'deki question generation logic'ini kopyalar
    // Şimdilik basit bir implementation yapalım
    return [
      {
        id: crypto.randomUUID(),
        question: "Test soru 1",
        type: "multiple_choice",
        options: ["A", "B", "C", "D"],
        correctAnswer: "A",
        explanation: "Test açıklama"
      },
      {
        id: crypto.randomUUID(),
        question: "Test soru 2", 
        type: "multiple_choice",
        options: ["A", "B", "C", "D"],
        correctAnswer: "B",
        explanation: "Test açıklama"
      }
    ];
  }

}

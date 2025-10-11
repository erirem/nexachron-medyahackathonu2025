import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { GameRoomRepository } from '../../../core/repositories/game-room.repository';
import { GameParticipantRepository } from '../../../core/repositories/game-participant.repository';
import { GameRoomEntity, GameRoomStatus } from '../../../core/entities/game-room.entity';
import { GameParticipantEntity } from '../../../core/entities/game-participant.entity';
import {
  CreateGameRoomDto,
  GameRoomResponseDto,
  JoinRoomDto,
} from '../../../shared/dto/game.dto';
import { ERROR_MESSAGES } from '../../../common/constants';

@Injectable()
export class GameRoomService {
  private readonly logger = new Logger(GameRoomService.name);

  constructor(
    private readonly gameRoomRepository: GameRoomRepository,
    private readonly gameParticipantRepository: GameParticipantRepository,
  ) {}

  // Room Management
  async createRoom(createRoomDto: CreateGameRoomDto, userId: string): Promise<GameRoomResponseDto> {
    try {
      const roomEntity = await this.gameRoomRepository.create({
        gameId: createRoomDto.gameId,
        name: createRoomDto.name,
        gameType: createRoomDto.gameType,
        maxPlayers: createRoomDto.maxPlayers,
        isPrivate: createRoomDto.isPrivate,
        password: createRoomDto.password,
        createdBy: userId,
      });

      // Add creator as first participant
      await this.gameParticipantRepository.create({
        gameId: createRoomDto.gameId,
        playerId: userId,
        playerName: 'Room Creator', // This should come from user service
      });

      return this.mapGameRoomEntityToDto(roomEntity);
    } catch (error) {
      this.logger.error('Error creating room:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getRoomById(id: string): Promise<GameRoomResponseDto> {
    const roomEntity = await this.gameRoomRepository.findById(id);
    if (!roomEntity) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }
    return this.mapGameRoomEntityToDto(roomEntity);
  }

  async getRooms(limit: number = 20): Promise<GameRoomResponseDto[]> {
    try {
      const rooms = await this.gameRoomRepository.findAvailableRooms(limit);
      return rooms.map(room => this.mapGameRoomEntityToDto(room));
    } catch (error) {
      this.logger.error('Error fetching rooms:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPublicRooms(limit: number = 20): Promise<GameRoomResponseDto[]> {
    try {
      const rooms = await this.gameRoomRepository.findPublicRooms(limit);
      return rooms.map(room => this.mapGameRoomEntityToDto(room));
    } catch (error) {
      this.logger.error('Error fetching public rooms:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserRooms(userId: string, limit: number = 20): Promise<GameRoomResponseDto[]> {
    try {
      const rooms = await this.gameRoomRepository.findByUser(userId, limit);
      return rooms.map(room => this.mapGameRoomEntityToDto(room));
    } catch (error) {
      this.logger.error('Error fetching user rooms:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPrivateRooms(userId: string, limit: number = 20): Promise<GameRoomResponseDto[]> {
    try {
      const rooms = await this.gameRoomRepository.findPrivateRooms(userId, limit);
      return rooms.map(room => this.mapGameRoomEntityToDto(room));
    } catch (error) {
      this.logger.error('Error fetching private rooms:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Room Control
  async joinRoom(roomId: string, playerId: string, joinRoomDto?: JoinRoomDto): Promise<GameRoomResponseDto> {
    try {
      const roomEntity = await this.gameRoomRepository.findById(roomId);
      if (!roomEntity) {
        throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
      }

      if (!roomEntity.canPlayerJoin(playerId)) {
        throw new BadRequestException('Cannot join this room');
      }

      // Check password if required
      if (roomEntity.isPasswordProtected() && joinRoomDto?.password) {
        if (!roomEntity.validatePassword(joinRoomDto.password)) {
          throw new BadRequestException('Invalid room password');
        }
      } else if (roomEntity.isPasswordProtected()) {
        throw new BadRequestException('Room password required');
      }

      // Add player to room
      const updatedRoom = await this.gameRoomRepository.addPlayer(roomId, playerId);

      // Add player as participant
      await this.gameParticipantRepository.create({
        gameId: roomEntity.gameId,
        playerId,
        playerName: 'Player', // This should come from user service
      });

      return this.mapGameRoomEntityToDto(updatedRoom);
    } catch (error) {
      this.logger.error('Error joining room:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async leaveRoom(roomId: string, playerId: string): Promise<GameRoomResponseDto> {
    try {
      const roomEntity = await this.gameRoomRepository.findById(roomId);
      if (!roomEntity) {
        throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
      }

      if (!roomEntity.hasPlayer(playerId)) {
        throw new BadRequestException('Player is not in this room');
      }

      // Remove player from room
      const updatedRoom = await this.gameRoomRepository.removePlayer(roomId, playerId);

      // Remove player as participant
      const participant = await this.gameParticipantRepository.findByGameAndPlayer(roomEntity.gameId, playerId);
      if (participant) {
        await this.gameParticipantRepository.delete(participant.id);
      }

      return this.mapGameRoomEntityToDto(updatedRoom);
    } catch (error) {
      this.logger.error('Error leaving room:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async startRoom(roomId: string): Promise<GameRoomResponseDto> {
    try {
      const roomEntity = await this.gameRoomRepository.findById(roomId);
      if (!roomEntity) {
        throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
      }

      if (!roomEntity.canStart()) {
        throw new BadRequestException('Room cannot be started');
      }

      const startedRoom = await this.gameRoomRepository.startRoom(roomId);
      return this.mapGameRoomEntityToDto(startedRoom);
    } catch (error) {
      this.logger.error('Error starting room:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async completeRoom(roomId: string): Promise<GameRoomResponseDto> {
    try {
      const roomEntity = await this.gameRoomRepository.findById(roomId);
      if (!roomEntity) {
        throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
      }

      const completedRoom = await this.gameRoomRepository.completeRoom(roomId);
      return this.mapGameRoomEntityToDto(completedRoom);
    } catch (error) {
      this.logger.error('Error completing room:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async cancelRoom(roomId: string): Promise<GameRoomResponseDto> {
    try {
      const roomEntity = await this.gameRoomRepository.findById(roomId);
      if (!roomEntity) {
        throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
      }

      const cancelledRoom = await this.gameRoomRepository.cancelRoom(roomId);
      return this.mapGameRoomEntityToDto(cancelledRoom);
    } catch (error) {
      this.logger.error('Error cancelling room:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Room Statistics
  async getRoomStats(roomId: string): Promise<any> {
    try {
      const roomEntity = await this.gameRoomRepository.findById(roomId);
      if (!roomEntity) {
        throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
      }

      const participants = await this.gameParticipantRepository.findByGameId(roomEntity.gameId);
      const readyParticipants = participants.filter(p => p.isReady);

      return {
        roomId,
        playerCount: roomEntity.getPlayerCount(),
        maxPlayers: roomEntity.maxPlayers,
        availableSlots: roomEntity.getAvailableSlots(),
        isFull: roomEntity.isFull(),
        isAvailable: roomEntity.isAvailable(),
        readyPlayers: readyParticipants.length,
        totalParticipants: participants.length,
        canStart: roomEntity.canStart(),
        duration: roomEntity.getDurationMinutes(),
      };
    } catch (error) {
      this.logger.error('Error getting room stats:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getAvailableRoomsCount(): Promise<number> {
    return this.gameRoomRepository.countAvailable();
  }

  async getUserRoomsCount(userId: string): Promise<number> {
    return this.gameRoomRepository.countByUser(userId);
  }

  // Helper Methods
  private mapGameRoomEntityToDto(roomEntity: GameRoomEntity): GameRoomResponseDto {
    return {
      id: roomEntity.id,
      gameId: roomEntity.gameId,
      name: roomEntity.name,
      gameType: roomEntity.gameType,
      maxPlayers: roomEntity.maxPlayers,
      currentPlayers: roomEntity.currentPlayers,
      isPrivate: roomEntity.isPrivate,
      status: roomEntity.status,
      createdBy: roomEntity.createdBy,
      createdAt: roomEntity.createdAt.toISOString(),
      startedAt: roomEntity.startedAt?.toISOString(),
      completedAt: roomEntity.completedAt?.toISOString(),
      playerCount: roomEntity.getPlayerCount(),
      availableSlots: roomEntity.getAvailableSlots(),
      isFull: roomEntity.isFull(),
      isAvailable: roomEntity.isAvailable(),
      canJoin: roomEntity.canJoin(),
      canStart: roomEntity.canStart(),
      isPasswordProtected: roomEntity.isPasswordProtected(),
    };
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  Req,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GameRoomService } from '../services/game-room.service';
import { SupabaseAuthGuard } from '../../../auth/supabase-auth.guard';
import {
  CreateGameRoomDto,
  GameRoomResponseDto,
  JoinRoomDto,
} from '../../../shared/dto/game.dto';
import { createSuccessResponse } from '../../../shared/dto/response.dto';
import { resolveLocale, translate } from '../../../i18n/i18n';
import type { AuthenticatedRequest } from '../../../auth/supabase-auth.guard';

@Controller('games/rooms')
@UseGuards(SupabaseAuthGuard)
export class GameRoomController {
  private readonly logger = new Logger(GameRoomController.name);

  constructor(private readonly gameRoomService: GameRoomService) {}

  /**
   * Create a new game room
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRoom(
    @Body() createRoomDto: CreateGameRoomDto,
    @Req() req: AuthenticatedRequest,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameRoomResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      return await this.gameRoomService.createRoom(createRoomDto, userId);
    } catch (error) {
      this.logger.error('Error creating room:', error);
      throw error;
    }
  }

  /**
   * Get all available rooms
   */
  @Get()
  async getRooms(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameRoomResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameRoomService.getRooms(limit);
    } catch (error) {
      this.logger.error('Error fetching rooms:', error);
      throw error;
    }
  }

  /**
   * Get public rooms
   */
  @Get('public')
  async getPublicRooms(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameRoomResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameRoomService.getPublicRooms(limit);
    } catch (error) {
      this.logger.error('Error fetching public rooms:', error);
      throw error;
    }
  }

  /**
   * Get user's rooms
   */
  @Get('my-rooms')
  async getUserRooms(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameRoomResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      return await this.gameRoomService.getUserRooms(userId, limit);
    } catch (error) {
      this.logger.error('Error fetching user rooms:', error);
      throw error;
    }
  }

  /**
   * Get private rooms
   */
  @Get('private')
  async getPrivateRooms(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameRoomResponseDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      return await this.gameRoomService.getPrivateRooms(userId, limit);
    } catch (error) {
      this.logger.error('Error fetching private rooms:', error);
      throw error;
    }
  }

  /**
   * Get a specific room by ID
   */
  @Get(':id')
  async getRoomById(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameRoomResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameRoomService.getRoomById(id);
    } catch (error) {
      this.logger.error('Error fetching room:', error);
      throw error;
    }
  }

  /**
   * Join a room
   */
  @Post(':id/join')
  async joinRoom(
    @Param('id') id: string,
    @Body() joinRoomDto: JoinRoomDto,
    @Req() req: AuthenticatedRequest,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameRoomResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      return await this.gameRoomService.joinRoom(id, userId, joinRoomDto);
    } catch (error) {
      this.logger.error('Error joining room:', error);
      throw error;
    }
  }

  /**
   * Leave a room
   */
  @Post(':id/leave')
  async leaveRoom(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameRoomResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      return await this.gameRoomService.leaveRoom(id, userId);
    } catch (error) {
      this.logger.error('Error leaving room:', error);
      throw error;
    }
  }

  /**
   * Start a room
   */
  @Post(':id/start')
  async startRoom(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameRoomResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameRoomService.startRoom(id);
    } catch (error) {
      this.logger.error('Error starting room:', error);
      throw error;
    }
  }

  /**
   * Complete a room
   */
  @Post(':id/complete')
  async completeRoom(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameRoomResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameRoomService.completeRoom(id);
    } catch (error) {
      this.logger.error('Error completing room:', error);
      throw error;
    }
  }

  /**
   * Cancel a room
   */
  @Post(':id/cancel')
  async cancelRoom(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<GameRoomResponseDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameRoomService.cancelRoom(id);
    } catch (error) {
      this.logger.error('Error cancelling room:', error);
      throw error;
    }
  }

  /**
   * Get room statistics
   */
  @Get(':id/stats')
  async getRoomStats(
    @Param('id') id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.gameRoomService.getRoomStats(id);
    } catch (error) {
      this.logger.error('Error fetching room stats:', error);
      throw error;
    }
  }

  /**
   * Get available rooms count
   */
  @Get('stats/available-count')
  async getAvailableRoomsCount(
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<{ count: number }> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const count = await this.gameRoomService.getAvailableRoomsCount();
      return { count };
    } catch (error) {
      this.logger.error('Error fetching available rooms count:', error);
      throw error;
    }
  }

  /**
   * Get user rooms count
   */
  @Get('stats/my-rooms-count')
  async getUserRoomsCount(
    @Req() req: AuthenticatedRequest,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<{ count: number }> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }
      const count = await this.gameRoomService.getUserRoomsCount(userId);
      return { count };
    } catch (error) {
      this.logger.error('Error fetching user rooms count:', error);
      throw error;
    }
  }
}

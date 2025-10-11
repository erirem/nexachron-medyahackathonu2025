/**
 * Refactored User Controller
 * Clean, SOLID-compliant user management controller
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { SupabaseAuthGuard } from '../../auth/guards/supabase-auth.guard';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserProfileDto,
  UserStatsDto,
  UserBasicInfoDto,
} from '../../../shared/dto/user.dto';
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';
import type { AuthenticatedRequest } from '../../auth/guards/supabase-auth.guard';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}


  /**
   * Get current user profile with stats
   */
  @Get('profile')
  async getCurrentUserProfile(@Req() req: AuthenticatedRequest): Promise<UserProfileDto> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User ID not found in request');
      }

      return await this.userService.getUserWithStats(userId);
    } catch (error) {
      this.logger.error('Error getting current user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID
   */
  @Get(':id/profile')
  async getUserProfile(@Param('id') id: string): Promise<UserProfileDto> {
    try {
      return await this.userService.getUserWithStats(id);
    } catch (error) {
      this.logger.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Get user basic info
   */
  @Get(':id/basic')
  async getUserBasicInfo(@Param('id') id: string): Promise<UserBasicInfoDto> {
    try {
      return await this.userService.getUserBasicInfo(id);
    } catch (error) {
      this.logger.error('Error getting user basic info:', error);
      throw error;
    }
  }

  /**
   * Get user stats
   */
  @Get(':id/stats')
  async getUserStats(@Param('id') id: string): Promise<UserStatsDto> {
    try {
      return await this.userService.getUserStats(id);
    } catch (error) {
      this.logger.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      return await this.userService.updateUser(id, updateUserDto);
    } catch (error) {
      this.logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Update user stats
   */
  @Put(':id/stats')
  async updateUserStats(
    @Param('id') id: string,
    @Body() body: { xpAmount: number; streak?: number },
  ): Promise<UserStatsDto> {
    try {
      return await this.userService.updateUserStats(id, body.xpAmount, body.streak);
    } catch (error) {
      this.logger.error('Error updating user stats:', error);
      throw error;
    }
  }

  /**
   * Update last seen
   */
  @Put(':id/last-seen')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLastSeen(@Param('id') id: string): Promise<void> {
    try {
      await this.userService.updateLastSeen(id);
    } catch (error) {
      this.logger.error('Error updating last seen:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    try {
      await this.userService.deleteUser(id);
    } catch (error) {
      this.logger.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get top users by XP
   */
  @Get('leaderboard/top')
  async getTopUsers(@Body() body: { limit?: number }): Promise<UserStatsDto[]> {
    try {
      const limit = body.limit || 10;
      return await this.userService.getTopUsers(limit);
    } catch (error) {
      this.logger.error('Error getting top users:', error);
      throw error;
    }
  }
}

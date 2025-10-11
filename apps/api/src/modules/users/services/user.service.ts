/**
 * Refactored User Service
 * Clean, SOLID-compliant user management service
 */

import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../../../core/repositories/user.repository';
import { UserStatsRepository } from '../../../core/repositories/user-stats.repository';
import { UserWithStatsEntity } from '../../../core/entities/user-with-stats.entity';
import { UserEntity } from '../../../core/entities/user.entity';
import { UserStatsEntity } from '../../../core/entities/user-stats.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserProfileDto,
  UserStatsDto,
  UserBasicInfoDto,
} from '../../../shared/dto/user.dto';
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userStatsRepository: UserStatsRepository,
  ) {}

  /**
   * Get user with stats by ID
   */
  async getUserWithStats(userId: string): Promise<UserProfileDto> {
    try {
      const [user, stats] = await Promise.all([
        this.userRepository.findById(userId),
        this.userStatsRepository.findById(userId),
      ]);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!stats) {
        // Create default stats if not exists
        const defaultStats = await this.userStatsRepository.create({
          userId,
          xp: 0,
          streak: 0,
          rankLevel: 1,
        });
        return this.mapToUserProfileDto(user, defaultStats);
      }

      return this.mapToUserProfileDto(user, stats);
    } catch (error) {
      this.logger.error('Error getting user with stats:', error);
      throw error;
    }
  }

  /**
   * Get user basic info
   */
  async getUserBasicInfo(userId: string): Promise<UserBasicInfoDto> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.getDisplayName(),
        initials: user.getInitials(),
        hasCompleteProfile: user.hasCompleteProfile(),
      };
    } catch (error) {
      this.logger.error('Error getting user basic info:', error);
      throw error;
    }
  }

  /**
   * Get user stats only
   */
  async getUserStats(userId: string): Promise<UserStatsDto> {
    try {
      const stats = await this.userStatsRepository.findById(userId);
      if (!stats) {
        throw new NotFoundException('User stats not found');
      }

      return {
        xp: stats.xp,
        streak: stats.streak,
        rankLevel: stats.rankLevel,
        rank: stats.getRank(),
        league: stats.getLeague(),
        xpToNextLevel: stats.getXpToNextLevel(),
        isActive: stats.isActive(),
        lastSeen: stats.lastSeen?.toISOString(),
      };
    } catch (error) {
      this.logger.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Create user
      const user = await this.userRepository.create(createUserDto);

      // Create default stats
      await this.userStatsRepository.create({
        userId: user.id,
        xp: 0,
        streak: 0,
        rankLevel: 1,
      });

      return this.mapToUserResponseDto(user);
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updatedUser = await this.userRepository.update(userId, updateUserDto);
      return this.mapToUserResponseDto(updatedUser);
    } catch (error) {
      this.logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Update user stats
   */
  async updateUserStats(userId: string, xpAmount: number, streak?: number): Promise<UserStatsDto> {
    try {
      const stats = await this.userStatsRepository.findById(userId);
      if (!stats) {
        throw new NotFoundException('User stats not found');
      }

      // Add XP
      const updatedStats = await this.userStatsRepository.addXp(userId, xpAmount);

      // Update streak if provided
      if (streak !== undefined) {
        await this.userStatsRepository.updateStreak(userId, streak);
      }

      return {
        xp: updatedStats.xp,
        streak: updatedStats.streak,
        rankLevel: updatedStats.rankLevel,
        rank: updatedStats.getRank(),
        league: updatedStats.getLeague(),
        xpToNextLevel: updatedStats.getXpToNextLevel(),
        isActive: updatedStats.isActive(),
        lastSeen: updatedStats.lastSeen?.toISOString(),
      };
    } catch (error) {
      this.logger.error('Error updating user stats:', error);
      throw error;
    }
  }

  /**
   * Update last seen
   */
  async updateLastSeen(userId: string): Promise<void> {
    try {
      await this.userStatsRepository.updateLastSeen(userId);
    } catch (error) {
      this.logger.error('Error updating last seen:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Delete user stats first
      await this.userStatsRepository.delete(userId);

      // Delete user
      return await this.userRepository.delete(userId);
    } catch (error) {
      this.logger.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get top users by XP
   */
  async getTopUsers(limit: number = 10): Promise<UserStatsDto[]> {
    try {
      const topStats = await this.userStatsRepository.getTopUsersByXp(limit);
      return topStats.map(stats => ({
        xp: stats.xp,
        streak: stats.streak,
        rankLevel: stats.rankLevel,
        rank: stats.getRank(),
        league: stats.getLeague(),
        xpToNextLevel: stats.getXpToNextLevel(),
        isActive: stats.isActive(),
        lastSeen: stats.lastSeen?.toISOString(),
      }));
    } catch (error) {
      this.logger.error('Error getting top users:', error);
      throw error;
    }
  }

  /**
   * Get user count
   */
  async getUserCount(): Promise<number> {
    try {
      return await this.userRepository.count();
    } catch (error) {
      this.logger.error('Error getting user count:', error);
      throw error;
    }
  }

  /**
   * Map UserEntity to UserResponseDto
   */
  private mapToUserResponseDto(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      city: user.city,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.getDisplayName(),
      initials: user.getInitials(),
      hasCompleteProfile: user.hasCompleteProfile(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Map UserEntity and UserStatsEntity to UserProfileDto
   */
  private mapToUserProfileDto(user: UserEntity, stats: UserStatsEntity): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      city: user.city,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.getDisplayName(),
      initials: user.getInitials(),
      hasCompleteProfile: user.hasCompleteProfile(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      xp: stats.xp,
      streak: stats.streak,
      rankLevel: stats.rankLevel,
      rank: stats.getRank(),
      league: stats.getLeague(),
      xpToNextLevel: stats.getXpToNextLevel(),
      isActive: stats.isActive(),
      lastSeen: stats.lastSeen?.toISOString(),
    };
  }
}

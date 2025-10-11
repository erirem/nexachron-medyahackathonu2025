/**
 * User DTOs for API requests and responses
 * Data Transfer Objects for user-related operations
 */

import { IsEmail, IsOptional, IsString, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  id: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  username?: string;
  city?: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  initials: string;
  hasCompleteProfile: boolean;
  createdAt: string;
  updatedAt: string;
}

export class UserProfileDto {
  id: string;
  email: string;
  username?: string;
  city?: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  initials: string;
  hasCompleteProfile: boolean;
  createdAt: string;
  updatedAt: string;
  // Stats
  xp: number;
  streak: number;
  rankLevel: number;
  rank: string;
  league: string;
  xpToNextLevel: number;
  isActive: boolean;
  lastSeen?: string;
}

export class UserStatsDto {
  xp: number;
  streak: number;
  rankLevel: number;
  rank: string;
  league: string;
  xpToNextLevel: number;
  isActive: boolean;
  lastSeen?: string;
}

export class UserBasicInfoDto {
  id: string;
  email: string;
  username?: string;
  displayName: string;
  initials: string;
  hasCompleteProfile: boolean;
}

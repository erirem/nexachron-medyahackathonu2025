/**
 * Auth DTOs
 * Data Transfer Objects for authentication operations
 */

import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsObject, IsUUID, IsInt, Min, Max, IsDateString, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Enums
export enum TokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  RESET_PASSWORD = 'RESET_PASSWORD',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  API_KEY = 'API_KEY',
}

export enum TokenStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
  USED = 'USED',
}

export enum LoginAttemptStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  BLOCKED = 'BLOCKED',
  LOCKED = 'LOCKED',
}

export enum LoginAttemptType {
  PASSWORD = 'PASSWORD',
  SOCIAL = 'SOCIAL',
  API_KEY = 'API_KEY',
  MAGIC_LINK = 'MAGIC_LINK',
}

// Request DTOs
export class LoginRequestDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: 'Remember me' })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;

  @ApiPropertyOptional({ description: 'Device information' })
  @IsOptional()
  @IsObject()
  deviceInfo?: {
    userAgent?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    isMobile?: boolean;
  };
}

export class RegisterRequestDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'User full name' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ description: 'Device information' })
  @IsOptional()
  @IsObject()
  deviceInfo?: {
    userAgent?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    isMobile?: boolean;
  };
}

export class RefreshTokenRequestDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  refreshToken: string;
}

export class ResetPasswordRequestDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordConfirmDto {
  @ApiProperty({ description: 'Reset token' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  newPassword: string;
}

export class ChangePasswordRequestDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  newPassword: string;
}

export class VerifyEmailRequestDto {
  @ApiProperty({ description: 'Verification token' })
  @IsString()
  token: string;
}

export class LogoutRequestDto {
  @ApiPropertyOptional({ description: 'Logout from all devices' })
  @IsOptional()
  @IsBoolean()
  allDevices?: boolean;
}

// Response DTOs
export class AuthResponseDto {
  @ApiProperty({ description: 'Access token' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Token type', example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: 'Expires in seconds' })
  expiresIn: number;

  @ApiProperty({ description: 'User information' })
  user: {
    id: string;
    email: string;
    fullName: string;
    isEmailVerified: boolean;
    createdAt: string;
  };
}

export class SessionResponseDto {
  @ApiProperty({ description: 'Session ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Session token' })
  sessionToken: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Expires at' })
  expiresAt: string;

  @ApiProperty({ description: 'Device information' })
  deviceInfo?: {
    userAgent?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    isMobile?: boolean;
  };

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Last activity at' })
  lastActivityAt?: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: string;

  @ApiProperty({ description: 'Is expired' })
  isExpired: boolean;

  @ApiProperty({ description: 'Is active session' })
  isActiveSession: boolean;

  @ApiProperty({ description: 'Session duration in milliseconds' })
  sessionDuration: number;

  @ApiProperty({ description: 'Time until expiry in milliseconds' })
  timeUntilExpiry: number;

  @ApiProperty({ description: 'Device summary' })
  deviceSummary: string;
}

export class TokenResponseDto {
  @ApiProperty({ description: 'Token ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Token type', enum: TokenType })
  tokenType: TokenType;

  @ApiProperty({ description: 'Token value' })
  tokenValue: string;

  @ApiProperty({ description: 'Expires at' })
  expiresAt: string;

  @ApiProperty({ description: 'Token status', enum: TokenStatus })
  status: TokenStatus;

  @ApiProperty({ description: 'Metadata' })
  metadata?: {
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
    purpose?: string;
  };

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: string;

  @ApiProperty({ description: 'Is expired' })
  isExpired: boolean;

  @ApiProperty({ description: 'Is active token' })
  isActiveToken: boolean;

  @ApiProperty({ description: 'Time until expiry in milliseconds' })
  timeUntilExpiry: number;

  @ApiProperty({ description: 'Token age in milliseconds' })
  tokenAge: number;

  @ApiProperty({ description: 'Token summary' })
  tokenSummary: string;
}

export class LoginAttemptResponseDto {
  @ApiProperty({ description: 'Attempt ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId?: string;

  @ApiProperty({ description: 'Email' })
  email?: string;

  @ApiProperty({ description: 'Attempt status', enum: LoginAttemptStatus })
  status: LoginAttemptStatus;

  @ApiProperty({ description: 'Attempt type', enum: LoginAttemptType })
  attemptType: LoginAttemptType;

  @ApiProperty({ description: 'IP address' })
  ipAddress?: string;

  @ApiProperty({ description: 'User agent' })
  userAgent?: string;

  @ApiProperty({ description: 'Device information' })
  deviceInfo?: {
    deviceType?: string;
    browser?: string;
    os?: string;
    isMobile?: boolean;
  };

  @ApiProperty({ description: 'Failure reason' })
  failureReason?: string;

  @ApiProperty({ description: 'Metadata' })
  metadata?: any;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: string;

  @ApiProperty({ description: 'Is successful' })
  isSuccessful: boolean;

  @ApiProperty({ description: 'Is failed' })
  isFailed: boolean;

  @ApiProperty({ description: 'Is blocked' })
  isBlocked: boolean;

  @ApiProperty({ description: 'Is locked' })
  isLocked: boolean;

  @ApiProperty({ description: 'Device summary' })
  deviceSummary: string;

  @ApiProperty({ description: 'Attempt age in milliseconds' })
  attemptAge: number;

  @ApiProperty({ description: 'Attempt age formatted' })
  attemptAgeFormatted: string;

  @ApiProperty({ description: 'Security level' })
  securityLevel: string;
}

// Query DTOs
export class AuthSessionQueryDto {
  @ApiPropertyOptional({ description: 'User ID filter' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Active sessions only' })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: 'Sort by field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class AuthTokenQueryDto {
  @ApiPropertyOptional({ description: 'User ID filter' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Token type filter', enum: TokenType })
  @IsOptional()
  @IsEnum(TokenType)
  tokenType?: TokenType;

  @ApiPropertyOptional({ description: 'Active tokens only' })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: 'Sort by field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class LoginAttemptQueryDto {
  @ApiPropertyOptional({ description: 'User ID filter' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Email filter' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'IP address filter' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Status filter', enum: LoginAttemptStatus })
  @IsOptional()
  @IsEnum(LoginAttemptStatus)
  status?: LoginAttemptStatus;

  @ApiPropertyOptional({ description: 'Attempt type filter', enum: LoginAttemptType })
  @IsOptional()
  @IsEnum(LoginAttemptType)
  attemptType?: LoginAttemptType;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: 'Sort by field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

// Analytics DTOs
export class AuthSessionStatsDto {
  @ApiProperty({ description: 'Total sessions' })
  totalSessions: number;

  @ApiProperty({ description: 'Active sessions' })
  activeSessions: number;

  @ApiProperty({ description: 'Expired sessions' })
  expiredSessions: number;

  @ApiProperty({ description: 'Inactive sessions' })
  inactiveSessions: number;

  @ApiProperty({ description: 'Average session duration in milliseconds' })
  averageSessionDuration: number;

  @ApiProperty({ description: 'Sessions by device type' })
  byDeviceType: Record<string, number>;
}

export class AuthTokenStatsDto {
  @ApiProperty({ description: 'Total tokens' })
  totalTokens: number;

  @ApiProperty({ description: 'Active tokens' })
  activeTokens: number;

  @ApiProperty({ description: 'Expired tokens' })
  expiredTokens: number;

  @ApiProperty({ description: 'Revoked tokens' })
  revokedTokens: number;

  @ApiProperty({ description: 'Used tokens' })
  usedTokens: number;

  @ApiProperty({ description: 'Tokens by type' })
  byTokenType: Record<string, number>;

  @ApiProperty({ description: 'Tokens by status' })
  byStatus: Record<string, number>;
}

export class LoginAttemptStatsDto {
  @ApiProperty({ description: 'Total attempts' })
  totalAttempts: number;

  @ApiProperty({ description: 'Successful attempts' })
  successfulAttempts: number;

  @ApiProperty({ description: 'Failed attempts' })
  failedAttempts: number;

  @ApiProperty({ description: 'Blocked attempts' })
  blockedAttempts: number;

  @ApiProperty({ description: 'Locked attempts' })
  lockedAttempts: number;

  @ApiProperty({ description: 'Attempts by type' })
  byAttemptType: Record<string, number>;

  @ApiProperty({ description: 'Attempts by status' })
  byStatus: Record<string, number>;

  @ApiProperty({ description: 'Attempts by device type' })
  byDeviceType: Record<string, number>;

  @ApiProperty({ description: 'Recent failed attempts' })
  recentFailedAttempts: number;

  @ApiProperty({ description: 'Suspicious activity count' })
  suspiciousActivity: number;
}

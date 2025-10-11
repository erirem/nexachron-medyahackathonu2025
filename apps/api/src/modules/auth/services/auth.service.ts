/**
 * Auth Service
 * Main authentication service
 */

import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';
import { AuthSessionRepository } from '../../../core/repositories/auth-session.repository';
import { AuthTokenRepository } from '../../../core/repositories/auth-token.repository';
import { AuthLoginAttemptRepository } from '../../../core/repositories/auth-login-attempt.repository';
import { UserRepository } from '../../../core/repositories/user.repository';
import { UserStatsRepository } from '../../../core/repositories/user-stats.repository';
import { AuthSessionEntity } from '../../../core/entities/auth-session.entity';
import { AuthTokenEntity, TokenType, TokenStatus } from '../../../core/entities/auth-token.entity';
import { AuthLoginAttemptEntity, LoginAttemptStatus, LoginAttemptType } from '../../../core/entities/auth-login-attempt.entity';
import { 
  LoginRequestDto, 
  RegisterRequestDto, 
  RefreshTokenRequestDto, 
  ResetPasswordRequestDto, 
  ResetPasswordConfirmDto,
  ChangePasswordRequestDto,
  VerifyEmailRequestDto,
  LogoutRequestDto,
  AuthResponseDto,
  SessionResponseDto,
  TokenResponseDto,
  LoginAttemptResponseDto,
  AuthSessionQueryDto,
  AuthTokenQueryDto,
  LoginAttemptQueryDto,
  AuthSessionStatsDto,
  AuthTokenStatsDto,
  LoginAttemptStatsDto
} from '../../../shared/dto/auth.dto';
import { PaginatedResponseDto } from '../../../shared/dto/pagination.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly authLoginAttemptRepository: AuthLoginAttemptRepository,
    private readonly userRepository: UserRepository,
    private readonly userStatsRepository: UserStatsRepository,
  ) {}

  async login(loginDto: LoginRequestDto): Promise<AuthResponseDto> {
    try {
      // Record login attempt
      await this.authLoginAttemptRepository.create({
        email: loginDto.email,
        status: LoginAttemptStatus.SUCCESS,
        attemptType: LoginAttemptType.PASSWORD,
        ipAddress: (loginDto.deviceInfo as any)?.ipAddress,
        userAgent: loginDto.deviceInfo?.userAgent,
        deviceInfo: loginDto.deviceInfo,
      });

      // Authenticate with Supabase
      const { data, error } = await this.supabaseService.supabase.auth.signInWithPassword({
        email: loginDto.email,
        password: loginDto.password,
      });

      if (error || !data.user) {
        // Record failed attempt
        await this.authLoginAttemptRepository.create({
          email: loginDto.email,
          status: LoginAttemptStatus.FAILED,
          attemptType: LoginAttemptType.PASSWORD,
          ipAddress: (loginDto.deviceInfo as any)?.ipAddress,
          userAgent: loginDto.deviceInfo?.userAgent,
          deviceInfo: loginDto.deviceInfo,
          failureReason: error?.message || 'Authentication failed',
        });

        throw new UnauthorizedException('Invalid credentials');
      }

      // Create session
      const session = await this.createSession(data.user.id, loginDto.deviceInfo);

      return {
        accessToken: data.session?.access_token || '',
        refreshToken: data.session?.refresh_token || '',
        tokenType: 'Bearer',
        expiresIn: data.session?.expires_in || 3600,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          fullName: data.user.user_metadata?.full_name || '',
          isEmailVerified: data.user.email_confirmed_at ? true : false,
          createdAt: data.user.created_at,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Login failed');
    }
  }

  async register(registerDto: RegisterRequestDto): Promise<AuthResponseDto> {
    try {
      console.log('Starting user registration for:', registerDto.email);
      
      // Register with Supabase
      const { data, error } = await this.supabaseService.supabase.auth.signUp({
        email: registerDto.email,
        password: registerDto.password,
        options: {
          data: {
            full_name: registerDto.fullName,
          },
        },
      });

      console.log('Supabase auth signup result:', { 
        data: !!data, 
        user: !!data?.user, 
        session: !!data?.session,
        error: error?.message,
        errorCode: error?.code 
      });

      if (error) {
        console.error('Supabase auth signup failed:', error);
        throw new ConflictException('Registration failed: ' + (error?.message || 'Unknown error'));
      }

      if (!data.user) {
        console.error('No user returned from Supabase auth signup');
        throw new ConflictException('Registration failed: No user returned');
      }

      // Create user in our database
      try {
        console.log('Creating user in database:', data.user.id);
        
        // Check if user already exists in our database
        const existingUser = await this.userRepository.findById(data.user.id);
        if (existingUser) {
          console.log('User already exists in database, skipping creation');
        } else {
          await this.userRepository.create({
            id: data.user.id,
            email: registerDto.email,
            username: registerDto.email.split('@')[0], // Use email prefix as username
          });
          console.log('User created successfully');
        }

        // Check if user stats already exist
        const existingStats = await this.userStatsRepository.findById(data.user.id);
        if (existingStats) {
          console.log('User stats already exist, skipping creation');
        } else {
          console.log('Creating user stats for:', data.user.id);
          // Create default user stats
          await this.userStatsRepository.create({
            userId: data.user.id,
            xp: 0,
            streak: 0,
            rankLevel: 1,
          });
          console.log('User stats created successfully');
        }
      } catch (dbError) {
        console.error('Failed to create user in database:', dbError);
        // Continue with auth even if DB creation fails
      }

      // Use Supabase Auth session (no need for custom session table)
      return {
        accessToken: data.session?.access_token || '',
        refreshToken: data.session?.refresh_token || '',
        tokenType: 'Bearer',
        expiresIn: data.session?.expires_in || 3600,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          fullName: data.user.user_metadata?.full_name || '',
          isEmailVerified: data.user.email_confirmed_at ? true : false,
          createdAt: data.user.created_at,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Registration failed');
    }
  }

  async refreshToken(refreshDto: RefreshTokenRequestDto): Promise<AuthResponseDto> {
    try {
      const { data, error } = await this.supabaseService.supabase.auth.refreshSession({
        refresh_token: refreshDto.refreshToken,
      });

      if (error || !data.user || !data.session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Update session
      await this.updateSession(data.user.id, data.session);

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        tokenType: 'Bearer',
        expiresIn: data.session.expires_in,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          fullName: data.user.user_metadata?.full_name || '',
          isEmailVerified: data.user.email_confirmed_at ? true : false,
          createdAt: data.user.created_at,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Token refresh failed');
    }
  }

  async logout(logoutDto: LogoutRequestDto, userId: string): Promise<boolean> {
    try {
      if (logoutDto.allDevices) {
        // Logout from all devices
        await this.authSessionRepository.deactivateUserSessions(userId);
        await this.authTokenRepository.revokeUserTokens(userId);
      } else {
        // Logout from current session only
        const sessions = await this.authSessionRepository.findActiveByUserId(userId);
        for (const session of sessions) {
          await this.authSessionRepository.update(session.id, { isActive: false });
        }
      }

      return true;
    } catch (error) {
      throw new BadRequestException('Logout failed');
    }
  }

  async resetPassword(resetDto: ResetPasswordRequestDto): Promise<boolean> {
    try {
      const { error } = await this.supabaseService.supabase.auth.resetPasswordForEmail(
        resetDto.email,
        {
          redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
        }
      );

      if (error) {
        throw new BadRequestException('Password reset failed');
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Password reset failed');
    }
  }

  async resetPasswordConfirm(confirmDto: ResetPasswordConfirmDto): Promise<boolean> {
    try {
      const { error } = await this.supabaseService.supabase.auth.updateUser({
        password: confirmDto.newPassword,
      });

      if (error) {
        throw new BadRequestException('Password reset confirmation failed');
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Password reset confirmation failed');
    }
  }

  async changePassword(changeDto: ChangePasswordRequestDto, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseService.supabase.auth.updateUser({
        password: changeDto.newPassword,
      });

      if (error) {
        throw new BadRequestException('Password change failed');
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Password change failed');
    }
  }

  async verifyEmail(verifyDto: VerifyEmailRequestDto): Promise<boolean> {
    try {
      const { error } = await this.supabaseService.supabase.auth.verifyOtp({
        token_hash: verifyDto.token,
        type: 'email',
      });

      if (error) {
        throw new BadRequestException('Email verification failed');
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Email verification failed');
    }
  }

  // Session management
  async getUserSessions(userId: string, query: AuthSessionQueryDto): Promise<PaginatedResponseDto<SessionResponseDto>> {
    const sessions = await this.authSessionRepository.findByUserId(userId);
    
    const filteredSessions = sessions.filter(session => {
      if (query.activeOnly && !session.isActiveSession()) return false;
      return true;
    });

    const startIndex = ((query.page || 1) - 1) * (query.pageSize || 20);
    const endIndex = startIndex + (query.pageSize || 20);
    const paginatedSessions = filteredSessions.slice(startIndex, endIndex);

    return {
      items: paginatedSessions.map(session => this.mapSessionToDto(session)),
      pagination: {
        page: query.page || 1,
        pageSize: query.pageSize || 20,
        total: filteredSessions.length,
        totalPages: Math.ceil(filteredSessions.length / (query.pageSize || 20)),
        hasMore: endIndex < filteredSessions.length,
      },
    };
  }

  async getUserTokens(userId: string, query: AuthTokenQueryDto): Promise<PaginatedResponseDto<TokenResponseDto>> {
    const tokens = await this.authTokenRepository.findByUserId(userId);
    
    const filteredTokens = tokens.filter(token => {
      if (query.tokenType && token.tokenType !== query.tokenType) return false;
      if (query.activeOnly && !token.isActiveToken()) return false;
      return true;
    });

    const startIndex = ((query.page || 1) - 1) * (query.pageSize || 20);
    const endIndex = startIndex + (query.pageSize || 20);
    const paginatedTokens = filteredTokens.slice(startIndex, endIndex);

    return {
      items: paginatedTokens.map(token => this.mapTokenToDto(token)),
      pagination: {
        page: query.page || 1,
        pageSize: query.pageSize || 20,
        total: filteredTokens.length,
        totalPages: Math.ceil(filteredTokens.length / (query.pageSize || 20)),
        hasMore: endIndex < filteredTokens.length,
      },
    };
  }

  async getLoginAttempts(query: LoginAttemptQueryDto): Promise<PaginatedResponseDto<LoginAttemptResponseDto>> {
    let attempts: AuthLoginAttemptEntity[] = [];

    if (query.userId) {
      attempts = await this.authLoginAttemptRepository.findByUserId(query.userId, query.pageSize || 50);
    } else if (query.email) {
      attempts = await this.authLoginAttemptRepository.findByEmail(query.email, query.pageSize || 50);
    } else if (query.ipAddress) {
      attempts = await this.authLoginAttemptRepository.findByIpAddress(query.ipAddress, query.pageSize || 50);
    } else {
      // Get all attempts (implement getAll method in repository if needed)
      attempts = [];
    }

    const filteredAttempts = attempts.filter(attempt => {
      if (query.status && attempt.status !== query.status) return false;
      if (query.attemptType && attempt.attemptType !== query.attemptType) return false;
      return true;
    });

    const startIndex = ((query.page || 1) - 1) * (query.pageSize || 20);
    const endIndex = startIndex + (query.pageSize || 20);
    const paginatedAttempts = filteredAttempts.slice(startIndex, endIndex);

    return {
      items: paginatedAttempts.map(attempt => this.mapLoginAttemptToDto(attempt)),
      pagination: {
        page: query.page || 1,
        pageSize: query.pageSize || 20,
        total: filteredAttempts.length,
        totalPages: Math.ceil(filteredAttempts.length / (query.pageSize || 20)),
        hasMore: endIndex < filteredAttempts.length,
      },
    };
  }

  // Analytics
  async getSessionStats(): Promise<AuthSessionStatsDto> {
    return await this.authSessionRepository.getSessionStats();
  }

  async getTokenStats(): Promise<AuthTokenStatsDto> {
    return await this.authTokenRepository.getTokenStats();
  }

  async getLoginAttemptStats(): Promise<LoginAttemptStatsDto> {
    return await this.authLoginAttemptRepository.getSecurityStats();
  }

  // Private helper methods
  private async createSession(userId: string, deviceInfo?: any): Promise<AuthSessionEntity> {
    const sessionToken = this.generateToken();
    const refreshToken = this.generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return await this.authSessionRepository.create({
      userId,
      sessionToken,
      refreshToken,
      expiresAt,
      deviceInfo,
      isActive: true,
      lastActivityAt: new Date(),
    });
  }

  private async updateSession(userId: string, session: any): Promise<void> {
    const sessions = await this.authSessionRepository.findActiveByUserId(userId);
    if (sessions.length > 0) {
      const latestSession = sessions[0];
      await this.authSessionRepository.update(latestSession.id, {
        sessionToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: new Date(Date.now() + session.expires_in * 1000),
        lastActivityAt: new Date(),
      });
    }
  }

  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private mapSessionToDto(session: AuthSessionEntity): SessionResponseDto {
    return {
      id: session.id,
      userId: session.userId,
      sessionToken: session.sessionToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt.toISOString(),
      deviceInfo: session.deviceInfo,
      isActive: session.isActive,
      lastActivityAt: session.lastActivityAt?.toISOString(),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      isExpired: session.isExpired(),
      isActiveSession: session.isActiveSession(),
      sessionDuration: session.getSessionDuration(),
      timeUntilExpiry: session.getTimeUntilExpiry(),
      deviceSummary: session.getDeviceSummary(),
    };
  }

  private mapTokenToDto(token: AuthTokenEntity): TokenResponseDto {
    return {
      id: token.id,
      userId: token.userId,
      tokenType: token.tokenType,
      tokenValue: token.tokenValue,
      expiresAt: token.expiresAt.toISOString(),
      status: token.status,
      metadata: token.metadata,
      isActive: token.isActive,
      createdAt: token.createdAt.toISOString(),
      updatedAt: token.updatedAt.toISOString(),
      isExpired: token.isExpired(),
      isActiveToken: token.isActiveToken(),
      timeUntilExpiry: token.getTimeUntilExpiry(),
      tokenAge: token.getTokenAge(),
      tokenSummary: token.getTokenSummary(),
    };
  }

  private mapLoginAttemptToDto(attempt: AuthLoginAttemptEntity): LoginAttemptResponseDto {
    return {
      id: attempt.id,
      userId: attempt.userId,
      email: attempt.email,
      status: attempt.status,
      attemptType: attempt.attemptType,
      ipAddress: attempt.ipAddress,
      userAgent: attempt.userAgent,
      deviceInfo: attempt.deviceInfo,
      failureReason: attempt.failureReason,
      metadata: attempt.metadata,
      createdAt: attempt.createdAt.toISOString(),
      updatedAt: attempt.updatedAt.toISOString(),
      isSuccessful: attempt.isSuccessful(),
      isFailed: attempt.isFailed(),
      isBlocked: attempt.isBlocked(),
      isLocked: attempt.isLocked(),
      deviceSummary: attempt.getDeviceSummary(),
      attemptAge: attempt.getAttemptAge(),
      attemptAgeFormatted: attempt.getAttemptAgeFormatted(),
      securityLevel: attempt.getSecurityLevel(),
    };
  }
}

/**
 * Auth Login Attempt Controller
 * Login attempt monitoring endpoints
 */

import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard';
import type { AuthenticatedRequest } from '../guards/supabase-auth.guard';
import {
  LoginAttemptQueryDto,
  LoginAttemptResponseDto,
  LoginAttemptStatsDto,
} from '../../../shared/dto/auth.dto';
import { PaginatedResponseDto } from '../../../shared/dto/pagination.dto';
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';
import { ERROR_MESSAGES, ERROR_CODES } from '../../../common/constants/errors';

@ApiTags('Auth Login Attempts')
@Controller('auth/login-attempts')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
export class AuthLoginAttemptController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiOperation({ summary: 'Get login attempts' })
  @ApiResponse({ status: 200, description: 'Login attempts retrieved successfully' })
  async getLoginAttempts(@Query() query: LoginAttemptQueryDto, @Req() req: AuthenticatedRequest) {
    try {
      // For security, users can only see their own login attempts
      const userQuery = { ...query, userId: req.user?.id };
      const result = await this.authService.getLoginAttempts(userQuery);
      return createSuccessResponse(result, 'Login attempts retrieved successfully');
    } catch (error) {
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get login attempt statistics' })
  @ApiResponse({ status: 200, description: 'Login attempt statistics retrieved successfully' })
  async getLoginAttemptStats() {
    try {
      const result = await this.authService.getLoginAttemptStats();
      return createSuccessResponse(result, 'Login attempt statistics retrieved successfully');
    } catch (error) {
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

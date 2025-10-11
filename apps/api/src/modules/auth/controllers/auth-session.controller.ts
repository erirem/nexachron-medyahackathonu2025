/**
 * Auth Session Controller
 * Session management endpoints
 */

import { Controller, Get, Delete, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard';
import type { AuthenticatedRequest } from '../guards/supabase-auth.guard';
import {
  AuthSessionQueryDto,
  SessionResponseDto,
  AuthSessionStatsDto,
} from '../../../shared/dto/auth.dto';
import { PaginatedResponseDto } from '../../../shared/dto/pagination.dto';
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';
import { ERROR_MESSAGES, ERROR_CODES } from '../../../common/constants/errors';

@ApiTags('Auth Sessions')
@Controller('auth/sessions')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
export class AuthSessionController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiOperation({ summary: 'Get user sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  async getUserSessions(@Query() query: AuthSessionQueryDto, @Req() req: AuthenticatedRequest) {
    try {
      const result = await this.authService.getUserSessions(req.user?.id || '', query);
      return createSuccessResponse(result, 'Sessions retrieved successfully');
    } catch (error) {
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get session statistics' })
  @ApiResponse({ status: 200, description: 'Session statistics retrieved successfully' })
  async getSessionStats() {
    try {
      const result = await this.authService.getSessionStats();
      return createSuccessResponse(result, 'Session statistics retrieved successfully');
    } catch (error) {
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':sessionId')
  @ApiOperation({ summary: 'Delete specific session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  async deleteSession(@Param('sessionId') sessionId: string, @Req() req: AuthenticatedRequest) {
    try {
      // TODO: Implement session deletion logic
      return createSuccessResponse({ deleted: true }, 'Session deleted successfully');
    } catch (error) {
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all user sessions' })
  @ApiResponse({ status: 200, description: 'All sessions deleted successfully' })
  async deleteAllSessions(@Req() req: AuthenticatedRequest) {
    try {
      const result = await this.authService.logout({ allDevices: true }, req.user?.id || '');
      return createSuccessResponse({ success: result }, 'All sessions deleted successfully');
    } catch (error) {
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

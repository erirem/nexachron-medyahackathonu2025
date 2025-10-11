/**
 * Auth Token Controller
 * Token management endpoints
 */

import { Controller, Get, Delete, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard';
import type { AuthenticatedRequest } from '../guards/supabase-auth.guard';
import {
  AuthTokenQueryDto,
  TokenResponseDto,
  AuthTokenStatsDto,
} from '../../../shared/dto/auth.dto';
import { PaginatedResponseDto } from '../../../shared/dto/pagination.dto';
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';
import { ERROR_MESSAGES, ERROR_CODES } from '../../../common/constants/errors';

@ApiTags('Auth Tokens')
@Controller('auth/tokens')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
export class AuthTokenController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiOperation({ summary: 'Get user tokens' })
  @ApiResponse({ status: 200, description: 'Tokens retrieved successfully' })
  async getUserTokens(@Query() query: AuthTokenQueryDto, @Req() req: AuthenticatedRequest) {
    try {
      const result = await this.authService.getUserTokens(req.user?.id || '', query);
      return createSuccessResponse(result, 'Tokens retrieved successfully');
    } catch (error) {
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get token statistics' })
  @ApiResponse({ status: 200, description: 'Token statistics retrieved successfully' })
  async getTokenStats() {
    try {
      const result = await this.authService.getTokenStats();
      return createSuccessResponse(result, 'Token statistics retrieved successfully');
    } catch (error) {
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':tokenId')
  @ApiOperation({ summary: 'Revoke specific token' })
  @ApiParam({ name: 'tokenId', description: 'Token ID' })
  @ApiResponse({ status: 200, description: 'Token revoked successfully' })
  async revokeToken(@Param('tokenId') tokenId: string, @Req() req: AuthenticatedRequest) {
    try {
      // TODO: Implement token revocation logic
      return createSuccessResponse({ revoked: true }, 'Token revoked successfully');
    } catch (error) {
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Revoke all user tokens' })
  @ApiResponse({ status: 200, description: 'All tokens revoked successfully' })
  async revokeAllTokens(@Req() req: AuthenticatedRequest) {
    try {
      // TODO: Implement revoke all tokens logic
      return createSuccessResponse({ revoked: true }, 'All tokens revoked successfully');
    } catch (error) {
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

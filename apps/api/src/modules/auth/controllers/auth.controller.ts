/**
 * Auth Controller
 * Main authentication endpoints
 */

import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard';
import type { AuthenticatedRequest } from '../guards/supabase-auth.guard';
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
} from '../../../shared/dto/auth.dto';
import { createSuccessResponse, createErrorResponse } from '../../../shared/dto/response.dto';
import { ERROR_MESSAGES, ERROR_CODES } from '../../../common/constants/errors';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginRequestDto) {
    try {
      const result = await this.authService.login(loginDto);
      return createSuccessResponse(result, 'Login successful');
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return createErrorResponse(ERROR_CODES.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
      }
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterRequestDto) {
    try {
      const result = await this.authService.register(registerDto);
      return createSuccessResponse(result, 'Registration successful');
    } catch (error) {
      if (error.message.includes('already exists')) {
        return createErrorResponse(ERROR_CODES.RESOURCE_ALREADY_EXISTS, ERROR_MESSAGES.RESOURCE_ALREADY_EXISTS);
      }
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshDto: RefreshTokenRequestDto) {
    try {
      const result = await this.authService.refreshToken(refreshDto);
      return createSuccessResponse(result, 'Token refreshed successfully');
    } catch (error) {
      if (error.message === 'Invalid refresh token') {
        return createErrorResponse(ERROR_CODES.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
      }
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Body() logoutDto: LogoutRequestDto, @Req() req: AuthenticatedRequest) {
    try {
      const result = await this.authService.logout(logoutDto, req.user?.id || '');
      return createSuccessResponse({ success: result }, 'Logout successful');
    } catch (error) {
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async resetPassword(@Body() resetDto: ResetPasswordRequestDto) {
    try {
      const result = await this.authService.resetPassword(resetDto);
      return createSuccessResponse({ success: result }, 'Password reset email sent');
    } catch (error) {
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('reset-password/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm password reset' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPasswordConfirm(@Body() confirmDto: ResetPasswordConfirmDto) {
    try {
      const result = await this.authService.resetPasswordConfirm(confirmDto);
      return createSuccessResponse({ success: result }, 'Password reset successful');
    } catch (error) {
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(@Body() changeDto: ChangePasswordRequestDto, @Req() req: AuthenticatedRequest) {
    try {
      const result = await this.authService.changePassword(changeDto, req.user?.id || '');
      return createSuccessResponse({ success: result }, 'Password changed successfully');
    } catch (error) {
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(@Body() verifyDto: VerifyEmailRequestDto) {
    try {
      const result = await this.authService.verifyEmail(verifyDto);
      return createSuccessResponse({ success: result }, 'Email verified successfully');
    } catch (error) {
      return createErrorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

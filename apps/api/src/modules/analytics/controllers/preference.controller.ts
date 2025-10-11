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
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserPreferenceService } from '../services/user-preference.service';
import {
  UserPreferenceDto,
  UpdateUserPreferenceDto,
} from '../../../shared/dto/analytics.dto';
import { createSuccessResponse } from '../../../shared/dto/response.dto';
import { resolveLocale, translate } from '../../../i18n/i18n';
import { SupabaseAuthGuard } from '../../auth/guards/supabase-auth.guard';
import { ERROR_MESSAGES } from '../../../common/constants';

@Controller('analytics/preferences')
export class PreferenceController {
  private readonly logger = new Logger(PreferenceController.name);

  constructor(private readonly userPreferenceService: UserPreferenceService) {}

  @Get('user/:userId')
  @UseGuards(SupabaseAuthGuard)
  async getUserPreferences(
    @Param('userId') userId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.getUserPreferences(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting user preferences:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Post('user/:userId')
  @UseGuards(SupabaseAuthGuard)
  async createUserPreferences(
    @Param('userId') userId: string,
    @Body() preferences: UpdateUserPreferenceDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.createUserPreferences(userId, preferences);
    } catch (error) {
      this.logger.error('Error creating user preferences:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Put('user/:userId')
  @UseGuards(SupabaseAuthGuard)
  async updateUserPreferences(
    @Param('userId') userId: string,
    @Body() preferences: UpdateUserPreferenceDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.updateUserPreferences(userId, preferences);
    } catch (error) {
      this.logger.error('Error updating user preferences:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Delete('user/:userId')
  @UseGuards(SupabaseAuthGuard)
  async deleteUserPreferences(
    @Param('userId') userId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const result = await this.userPreferenceService.deleteUserPreferences(userId);
      return createSuccessResponse({ deleted: result });
    } catch (error) {
      this.logger.error('Error deleting user preferences:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('language/:language')
  async getPreferencesByLanguage(
    @Param('language') language: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.getPreferencesByLanguage(language);
    } catch (error) {
      this.logger.error('Error getting preferences by language:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('personalization')
  async getPreferencesWithPersonalization(
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.getPreferencesWithPersonalization();
    } catch (error) {
      this.logger.error('Error getting preferences with personalization:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('category/:category')
  async getPreferencesByCategory(
    @Param('category') category: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.getPreferencesByCategory(category);
    } catch (error) {
      this.logger.error('Error getting preferences by category:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('mood/:mood')
  async getPreferencesByMood(
    @Param('mood') mood: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.getPreferencesByMood(mood);
    } catch (error) {
      this.logger.error('Error getting preferences by mood:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('recent')
  async getRecentPreferences(
    @Query('days') days?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.getRecentPreferences(days || 30);
    } catch (error) {
      this.logger.error('Error getting recent preferences:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('stats')
  async getPreferenceStats(
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.getPreferenceStats();
    } catch (error) {
      this.logger.error('Error getting preference stats:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('high-engagement')
  async getHighEngagementUsers(
    @Query('limit') limit?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.getHighEngagementUsers(limit || 50);
    } catch (error) {
      this.logger.error('Error getting high engagement users:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('needing-update')
  async getUsersNeedingUpdate(
    @Query('days') days?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto[]> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.getUsersNeedingUpdate(days || 90);
    } catch (error) {
      this.logger.error('Error getting users needing update:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('insights/:userId')
  @UseGuards(SupabaseAuthGuard)
  async getPreferenceInsights(
    @Param('userId') userId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.getPreferenceInsights(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting preference insights:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('recommendation-weight/:userId')
  @UseGuards(SupabaseAuthGuard)
  async getRecommendationWeight(
    @Param('userId') userId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<any> {
    const locale = resolveLocale(acceptLanguage);
    try {
      const weight = await this.userPreferenceService.getRecommendationWeight(userId);
      return createSuccessResponse({ weight });
    } catch (error) {
      this.logger.error('Error getting recommendation weight:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  // Category preference management
  @Post('user/:userId/category/:category')
  @UseGuards(SupabaseAuthGuard)
  async addCategoryPreference(
    @Param('userId') userId: string,
    @Param('category') category: string,
    @Body('weight') weight?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.addCategoryPreference(userId, category, weight || 1);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error adding category preference:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Delete('user/:userId/category/:category')
  @UseGuards(SupabaseAuthGuard)
  async removeCategoryPreference(
    @Param('userId') userId: string,
    @Param('category') category: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.removeCategoryPreference(userId, category);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error removing category preference:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  // Mood preference management
  @Post('user/:userId/mood/:mood')
  @UseGuards(SupabaseAuthGuard)
  async addMoodPreference(
    @Param('userId') userId: string,
    @Param('mood') mood: string,
    @Body('weight') weight?: number,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.addMoodPreference(userId, mood, weight || 1);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error adding mood preference:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Delete('user/:userId/mood/:mood')
  @UseGuards(SupabaseAuthGuard)
  async removeMoodPreference(
    @Param('userId') userId: string,
    @Param('mood') mood: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.removeMoodPreference(userId, mood);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error removing mood preference:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  // Language preference
  @Put('user/:userId/language')
  @UseGuards(SupabaseAuthGuard)
  async setLanguage(
    @Param('userId') userId: string,
    @Body('language') language: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.setLanguage(userId, language);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error setting language:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  // Personalization toggle
  @Put('user/:userId/personalization/enable')
  @UseGuards(SupabaseAuthGuard)
  async enablePersonalization(
    @Param('userId') userId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.enablePersonalization(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error enabling personalization:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }

  @Put('user/:userId/personalization/disable')
  @UseGuards(SupabaseAuthGuard)
  async disablePersonalization(
    @Param('userId') userId: string,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<UserPreferenceDto> {
    const locale = resolveLocale(acceptLanguage);
    try {
      return await this.userPreferenceService.disablePersonalization(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error disabling personalization:', error);
      throw new InternalServerErrorException(translate(locale, ERROR_MESSAGES.INTERNAL_SERVER_ERROR));
    }
  }
}

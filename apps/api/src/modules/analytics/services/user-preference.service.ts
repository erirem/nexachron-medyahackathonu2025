import { Injectable, Logger, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { UserPreferenceRepository } from '../../../core/repositories/user-preference.repository';
import { UserProfilePreferenceEntity } from '../../../core/entities/user-profile-preference.entity';
import { UserPreferenceDto, UpdateUserPreferenceDto } from '../../../shared/dto/analytics.dto';
import { ERROR_MESSAGES } from '../../../common/constants';

@Injectable()
export class UserPreferenceService {
  private readonly logger = new Logger(UserPreferenceService.name);

  constructor(
    private readonly userPreferenceRepository: UserPreferenceRepository,
  ) {}

  async getUserPreferences(userId: string): Promise<UserPreferenceDto> {
    try {
      const preferences = await this.userPreferenceRepository.findByUserId(userId);
      if (!preferences) {
        throw new NotFoundException('User preferences not found');
      }
      return this.mapUserPreferenceEntityToDto(preferences);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting user preferences:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async createUserPreferences(userId: string, preferences: UpdateUserPreferenceDto): Promise<UserPreferenceDto> {
    try {
      const createData = {
        userId,
        personalizationOptIn: preferences.personalizationOptIn ?? true,
        categories: preferences.categories,
        targetMoods: preferences.targetMoods,
        language: preferences.language,
      };

      const newPreferences = await this.userPreferenceRepository.create(createData);
      return this.mapUserPreferenceEntityToDto(newPreferences);
    } catch (error) {
      this.logger.error('Error creating user preferences:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUserPreferences(userId: string, preferences: UpdateUserPreferenceDto): Promise<UserPreferenceDto> {
    try {
      const updatedPreferences = await this.userPreferenceRepository.upsertPreferences(userId, preferences);
      return this.mapUserPreferenceEntityToDto(updatedPreferences);
    } catch (error) {
      this.logger.error('Error updating user preferences:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteUserPreferences(userId: string): Promise<boolean> {
    try {
      return await this.userPreferenceRepository.delete(userId);
    } catch (error) {
      this.logger.error('Error deleting user preferences:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPreferencesByLanguage(language: string): Promise<UserPreferenceDto[]> {
    try {
      const preferences = await this.userPreferenceRepository.getPreferencesByLanguage(language);
      return preferences.map(this.mapUserPreferenceEntityToDto);
    } catch (error) {
      this.logger.error('Error getting preferences by language:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPreferencesWithPersonalization(): Promise<UserPreferenceDto[]> {
    try {
      const preferences = await this.userPreferenceRepository.getPreferencesWithPersonalization();
      return preferences.map(this.mapUserPreferenceEntityToDto);
    } catch (error) {
      this.logger.error('Error getting preferences with personalization:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPreferencesByCategory(category: string): Promise<UserPreferenceDto[]> {
    try {
      const preferences = await this.userPreferenceRepository.getPreferencesByCategory(category);
      return preferences.map(this.mapUserPreferenceEntityToDto);
    } catch (error) {
      this.logger.error('Error getting preferences by category:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPreferencesByMood(mood: string): Promise<UserPreferenceDto[]> {
    try {
      const preferences = await this.userPreferenceRepository.getPreferencesByMood(mood);
      return preferences.map(this.mapUserPreferenceEntityToDto);
    } catch (error) {
      this.logger.error('Error getting preferences by mood:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getRecentPreferences(days: number = 30): Promise<UserPreferenceDto[]> {
    try {
      const preferences = await this.userPreferenceRepository.getRecentPreferences(days);
      return preferences.map(this.mapUserPreferenceEntityToDto);
    } catch (error) {
      this.logger.error('Error getting recent preferences:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getPreferenceStats(): Promise<{
    totalUsers: number;
    personalizationOptIn: number;
    averageCategories: number;
    averageMoods: number;
    topLanguages: Array<{ language: string; count: number }>;
    topCategories: Array<{ category: string; count: number }>;
    topMoods: Array<{ mood: string; count: number }>;
  }> {
    try {
      return await this.userPreferenceRepository.getPreferenceStats();
    } catch (error) {
      this.logger.error('Error getting preference stats:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getHighEngagementUsers(limit: number = 50): Promise<UserPreferenceDto[]> {
    try {
      const preferences = await this.userPreferenceRepository.getHighEngagementUsers(limit);
      return preferences.map(this.mapUserPreferenceEntityToDto);
    } catch (error) {
      this.logger.error('Error getting high engagement users:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUsersNeedingUpdate(days: number = 90): Promise<UserPreferenceDto[]> {
    try {
      const preferences = await this.userPreferenceRepository.getUsersNeedingUpdate(days);
      return preferences.map(this.mapUserPreferenceEntityToDto);
    } catch (error) {
      this.logger.error('Error getting users needing update:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Preference management methods
  async addCategoryPreference(userId: string, category: string, weight: number = 1): Promise<UserPreferenceDto> {
    try {
      const preferences = await this.userPreferenceRepository.findByUserId(userId);
      if (!preferences) {
        throw new NotFoundException('User preferences not found');
      }

      preferences.addCategoryPreference(category, weight);
      const updatedPreferences = await this.userPreferenceRepository.update(userId, {
        categories: preferences.categories,
      });

      return this.mapUserPreferenceEntityToDto(updatedPreferences);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error adding category preference:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async removeCategoryPreference(userId: string, category: string): Promise<UserPreferenceDto> {
    try {
      const preferences = await this.userPreferenceRepository.findByUserId(userId);
      if (!preferences) {
        throw new NotFoundException('User preferences not found');
      }

      preferences.removeCategoryPreference(category);
      const updatedPreferences = await this.userPreferenceRepository.update(userId, {
        categories: preferences.categories,
      });

      return this.mapUserPreferenceEntityToDto(updatedPreferences);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error removing category preference:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async addMoodPreference(userId: string, mood: string, weight: number = 1): Promise<UserPreferenceDto> {
    try {
      const preferences = await this.userPreferenceRepository.findByUserId(userId);
      if (!preferences) {
        throw new NotFoundException('User preferences not found');
      }

      preferences.addMoodPreference(mood, weight);
      const updatedPreferences = await this.userPreferenceRepository.update(userId, {
        targetMoods: preferences.targetMoods,
      });

      return this.mapUserPreferenceEntityToDto(updatedPreferences);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error adding mood preference:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async removeMoodPreference(userId: string, mood: string): Promise<UserPreferenceDto> {
    try {
      const preferences = await this.userPreferenceRepository.findByUserId(userId);
      if (!preferences) {
        throw new NotFoundException('User preferences not found');
      }

      preferences.removeMoodPreference(mood);
      const updatedPreferences = await this.userPreferenceRepository.update(userId, {
        targetMoods: preferences.targetMoods,
      });

      return this.mapUserPreferenceEntityToDto(updatedPreferences);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error removing mood preference:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async setLanguage(userId: string, language: string): Promise<UserPreferenceDto> {
    try {
      const preferences = await this.userPreferenceRepository.findByUserId(userId);
      if (!preferences) {
        throw new NotFoundException('User preferences not found');
      }

      preferences.setLanguage(language);
      const updatedPreferences = await this.userPreferenceRepository.update(userId, {
        language: preferences.language,
      });

      return this.mapUserPreferenceEntityToDto(updatedPreferences);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error setting language:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async enablePersonalization(userId: string): Promise<UserPreferenceDto> {
    try {
      const preferences = await this.userPreferenceRepository.findByUserId(userId);
      if (!preferences) {
        throw new NotFoundException('User preferences not found');
      }

      preferences.enablePersonalization();
      const updatedPreferences = await this.userPreferenceRepository.update(userId, {
        personalizationOptIn: preferences.personalizationOptIn,
      });

      return this.mapUserPreferenceEntityToDto(updatedPreferences);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error enabling personalization:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async disablePersonalization(userId: string): Promise<UserPreferenceDto> {
    try {
      const preferences = await this.userPreferenceRepository.findByUserId(userId);
      if (!preferences) {
        throw new NotFoundException('User preferences not found');
      }

      preferences.disablePersonalization();
      const updatedPreferences = await this.userPreferenceRepository.update(userId, {
        personalizationOptIn: preferences.personalizationOptIn,
      });

      return this.mapUserPreferenceEntityToDto(updatedPreferences);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error disabling personalization:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Analytics methods
  async getPreferenceInsights(userId: string): Promise<{
    preferenceScore: number;
    personalizationLevel: string;
    topCategories: Array<{ category: string; weight: number }>;
    topMoods: Array<{ mood: string; weight: number }>;
    engagementLevel: string;
    needsUpdate: boolean;
  }> {
    try {
      const preferences = await this.userPreferenceRepository.findByUserId(userId);
      if (!preferences) {
        throw new NotFoundException('User preferences not found');
      }

      return {
        preferenceScore: preferences.getPreferenceScore(),
        personalizationLevel: preferences.getPersonalizationLevel(),
        topCategories: preferences.getTopCategories(5),
        topMoods: preferences.getTopMoods(5),
        engagementLevel: preferences.getEngagementLevel(),
        needsUpdate: preferences.needsUpdate(),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting preference insights:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getRecommendationWeight(userId: string): Promise<number> {
    try {
      const preferences = await this.userPreferenceRepository.findByUserId(userId);
      if (!preferences) {
        return 0;
      }
      return preferences.getRecommendationWeight();
    } catch (error) {
      this.logger.error('Error getting recommendation weight:', error);
      throw new InternalServerErrorException(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Private helper methods
  private mapUserPreferenceEntityToDto(entity: UserProfilePreferenceEntity): UserPreferenceDto {
    return {
      userId: entity.userId,
      personalizationOptIn: entity.personalizationOptIn,
      categories: entity.categories,
      targetMoods: entity.targetMoods,
      language: entity.language,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      preferredCategories: entity.getPreferredCategories(),
      preferredMoods: entity.getPreferredMoods(),
      preferenceScore: entity.getPreferenceScore(),
      personalizationLevel: entity.getPersonalizationLevel(),
    };
  }
}

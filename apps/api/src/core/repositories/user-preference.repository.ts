import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { UserProfilePreferenceEntity, CreateUserProfilePreferenceData, UpdateUserProfilePreferenceData } from '../entities/user-profile-preference.entity';
import { DATABASE_TABLES } from '../../common/constants';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class UserPreferenceRepository extends BaseRepository<UserProfilePreferenceEntity> {
  private readonly tableName = DATABASE_TABLES.USER_PROFILE_PREFERENCES;

  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findById(id: string): Promise<UserProfilePreferenceEntity | null> {
    if (!this.validateUuid(id)) {
      return null;
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', id)
        .maybeSingle();

      if (error) {
        this.handleError(error, 'findById');
      }
      return data ? new UserProfilePreferenceEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findById');
    }
  }

  async create(data: CreateUserProfilePreferenceData): Promise<UserProfilePreferenceEntity> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert({
          user_id: data.userId,
          personalization_opt_in: data.personalizationOptIn ?? true,
          categories: data.categories,
          target_moods: data.targetMoods,
          language: data.language,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'create');
      }
      return new UserProfilePreferenceEntity(result);
    } catch (error) {
      this.handleError(error, 'create');
    }
  }

  async update(id: string, data: UpdateUserProfilePreferenceData): Promise<UserProfilePreferenceEntity> {
    if (!this.validateUuid(id)) {
      throw new Error('Invalid user ID');
    }
    try {
      const updateData: any = {};
      if (data.personalizationOptIn !== undefined) updateData.personalization_opt_in = data.personalizationOptIn;
      if (data.categories !== undefined) updateData.categories = data.categories;
      if (data.targetMoods !== undefined) updateData.target_moods = data.targetMoods;
      if (data.language !== undefined) updateData.language = data.language;

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('user_id', id)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'update');
      }
      return new UserProfilePreferenceEntity(result);
    } catch (error) {
      this.handleError(error, 'update');
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!this.validateUuid(id)) {
      return false;
    }
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', id);

      if (error) {
        this.handleError(error, 'delete');
      }
      return true;
    } catch (error) {
      this.handleError(error, 'delete');
    }
  }

  async findByUserId(userId: string): Promise<UserProfilePreferenceEntity | null> {
    if (!this.validateUuid(userId)) {
      return null;
    }
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        this.handleError(error, 'findByUserId');
      }
      return data ? new UserProfilePreferenceEntity(data) : null;
    } catch (error) {
      this.handleError(error, 'findByUserId');
    }
  }

  async upsertPreferences(userId: string, data: UpdateUserProfilePreferenceData): Promise<UserProfilePreferenceEntity> {
    if (!this.validateUuid(userId)) {
      throw new Error('Invalid user ID');
    }
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .upsert({
          user_id: userId,
          personalization_opt_in: data.personalizationOptIn,
          categories: data.categories,
          target_moods: data.targetMoods,
          language: data.language,
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'upsertPreferences');
      }
      return new UserProfilePreferenceEntity(result);
    } catch (error) {
      this.handleError(error, 'upsertPreferences');
    }
  }

  async getPreferencesByLanguage(language: string): Promise<UserProfilePreferenceEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('language', language)
        .order('updated_at', { ascending: false });

      if (error) {
        this.handleError(error, 'getPreferencesByLanguage');
      }
      return data ? data.map(row => new UserProfilePreferenceEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getPreferencesByLanguage');
    }
  }

  async getPreferencesWithPersonalization(): Promise<UserProfilePreferenceEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('personalization_opt_in', true)
        .order('updated_at', { ascending: false });

      if (error) {
        this.handleError(error, 'getPreferencesWithPersonalization');
      }
      return data ? data.map(row => new UserProfilePreferenceEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getPreferencesWithPersonalization');
    }
  }

  async getPreferencesByCategory(category: string): Promise<UserProfilePreferenceEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .contains('categories', { [category]: true })
        .order('updated_at', { ascending: false });

      if (error) {
        this.handleError(error, 'getPreferencesByCategory');
      }
      return data ? data.map(row => new UserProfilePreferenceEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getPreferencesByCategory');
    }
  }

  async getPreferencesByMood(mood: string): Promise<UserProfilePreferenceEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .contains('target_moods', { [mood]: true })
        .order('updated_at', { ascending: false });

      if (error) {
        this.handleError(error, 'getPreferencesByMood');
      }
      return data ? data.map(row => new UserProfilePreferenceEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getPreferencesByMood');
    }
  }

  async getRecentPreferences(days: number = 30): Promise<UserProfilePreferenceEntity[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('updated_at', cutoffDate.toISOString())
        .order('updated_at', { ascending: false });

      if (error) {
        this.handleError(error, 'getRecentPreferences');
      }
      return data ? data.map(row => new UserProfilePreferenceEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getRecentPreferences');
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
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*');

      if (error) {
        this.handleError(error, 'getPreferenceStats');
      }

      if (!data) {
        return {
          totalUsers: 0,
          personalizationOptIn: 0,
          averageCategories: 0,
          averageMoods: 0,
          topLanguages: [],
          topCategories: [],
          topMoods: [],
        };
      }

      const preferences = data.map(row => new UserProfilePreferenceEntity(row));
      const totalUsers = preferences.length;
      const personalizationOptIn = preferences.filter(p => p.personalizationOptIn).length;
      
      const categoryCounts = preferences.reduce((acc, p) => {
        const categories = p.getPreferredCategories();
        categories.forEach(cat => {
          acc[cat] = (acc[cat] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      const moodCounts = preferences.reduce((acc, p) => {
        const moods = p.getPreferredMoods();
        moods.forEach(mood => {
          acc[mood] = (acc[mood] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      const languageCounts = preferences.reduce((acc, p) => {
        const lang = p.getLanguage();
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const averageCategories = preferences.reduce((sum, p) => sum + p.getPreferredCategories().length, 0) / totalUsers;
      const averageMoods = preferences.reduce((sum, p) => sum + p.getPreferredMoods().length, 0) / totalUsers;

      const topLanguages = Object.entries(languageCounts)
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const topMoods = Object.entries(moodCounts)
        .map(([mood, count]) => ({ mood, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalUsers,
        personalizationOptIn,
        averageCategories,
        averageMoods,
        topLanguages,
        topCategories,
        topMoods,
      };
    } catch (error) {
      this.handleError(error, 'getPreferenceStats');
    }
  }

  async getHighEngagementUsers(limit: number = 50): Promise<UserProfilePreferenceEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('personalization_opt_in', true)
        .not('categories', 'is', null)
        .not('target_moods', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'getHighEngagementUsers');
      }
      return data ? data.map(row => new UserProfilePreferenceEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getHighEngagementUsers');
    }
  }

  async getUsersNeedingUpdate(days: number = 90): Promise<UserProfilePreferenceEntity[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .lte('updated_at', cutoffDate.toISOString())
        .order('updated_at', { ascending: true });

      if (error) {
        this.handleError(error, 'getUsersNeedingUpdate');
      }
      return data ? data.map(row => new UserProfilePreferenceEntity(row)) : [];
    } catch (error) {
      this.handleError(error, 'getUsersNeedingUpdate');
    }
  }
}

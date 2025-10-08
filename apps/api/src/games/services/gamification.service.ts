import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { GameResult, GameType } from '../dto/game.dto';

interface UserProgress {
  userId: string;
  xpEarned: number;
  streakBonus: number;
  leagueBonus: number;
  totalXP: number;
  newRank?: string;
  newLeague?: string;
  badgesEarned: string[];
}

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Kullanıcı ilerlemesini güncelle
   */
  async updateUserProgress(userId: string, gameResult: GameResult): Promise<UserProgress> {
    this.logger.log(`Updating progress for user ${userId} with ${gameResult.xpEarned} XP`);

    try {
      // Mevcut kullanıcı profilini getir
      const userProfile = await this.getUserProfile(userId);
      
      // XP hesapla
      const progress = await this.calculateProgress(userProfile, gameResult);
      
      // Profili güncelle
      await this.updateUserProfile(userId, progress);
      
      // Streak kontrolü
      await this.updateStreak(userId, gameResult);
      
      // Rozet kontrolü
      const newBadges = await this.checkBadges(userId, progress);
      
      return {
        ...progress,
        badgesEarned: newBadges,
      };
    } catch (error) {
      this.logger.error(`Failed to update user progress: ${error.message}`);
      throw error;
    }
  }

  /**
   * Liderlik tablosunu getir
   */
  async getLeaderboard(
    gameType?: GameType,
    period: 'daily' | 'weekly' | 'monthly' | 'all' = 'weekly',
    limit: number = 50,
  ) {
    this.logger.log(`Fetching leaderboard for ${period} period`);

    try {
      let dateFilter = '';
      switch (period) {
        case 'daily':
          dateFilter = `AND gr.completed_at >= NOW() - INTERVAL '1 day'`;
          break;
        case 'weekly':
          dateFilter = `AND gr.completed_at >= NOW() - INTERVAL '7 days'`;
          break;
        case 'monthly':
          dateFilter = `AND gr.completed_at >= NOW() - INTERVAL '30 days'`;
          break;
      }

      const gameTypeFilter = gameType ? `AND g.type = '${gameType}'` : '';

      const { data, error } = await this.supabaseService.supabase.rpc('get_leaderboard', {
        period_filter: dateFilter,
        game_type_filter: gameTypeFilter,
        limit_count: limit,
      });

      if (error) {
        throw new Error(`Failed to fetch leaderboard: ${error.message}`);
      }

      return {
        period,
        gameType,
        rankings: data,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get leaderboard: ${error.message}`);
      throw error;
    }
  }

  /**
   * Kullanıcı istatistiklerini getir
   */
  async getUserStats(userId: string) {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch user stats: ${error.message}`);
      }

      return data || this.getDefaultUserStats(userId);
    } catch (error) {
      this.logger.error(`Failed to get user stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Günlük görevleri kontrol et
   */
  async checkDailyTasks(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Günlük görevleri getir
      const { data: tasks, error } = await this.supabaseService.supabase
        .from('daily_tasks')
        .select('*')
        .eq('date', today);

      if (error) {
        throw new Error(`Failed to fetch daily tasks: ${error.message}`);
      }

      // Kullanıcının bugünkü aktivitelerini kontrol et
      const userActivities = await this.getUserDailyActivities(userId, today);
      
      // Görevleri güncelle
      const updatedTasks = tasks.map(task => ({
        ...task,
        completed: this.isTaskCompleted(task, userActivities),
        progress: this.calculateTaskProgress(task, userActivities),
      }));

      return updatedTasks;
    } catch (error) {
      this.logger.error(`Failed to check daily tasks: ${error.message}`);
      throw error;
    }
  }

  // Private helper methods

  private async getUserProfile(userId: string) {
    const { data, error } = await this.supabaseService.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Kullanıcı profili yok, oluştur
        return await this.createUserProfile(userId);
      }
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return data;
  }

  private async createUserProfile(userId: string) {
    const { data, error } = await this.supabaseService.supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        xp: 0,
        current_rank: 'NEW_MEMBER',
        league: 'BRONZE',
        current_streak: 0,
        longest_streak: 0,
        badges: [],
        streak_protection: 0,
        join_date: new Date().toISOString(),
        last_active: new Date().toISOString(),
        weekly_xp: 0,
        monthly_xp: 0,
        season_xp: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }

    return data;
  }

  private async calculateProgress(userProfile: any, gameResult: GameResult) {
    const baseXP = gameResult.xpEarned;
    const streakBonus = await this.calculateStreakBonus(userProfile.user_id);
    const leagueBonus = this.calculateLeagueBonus(userProfile.league, baseXP);
    
    const totalXP = baseXP + streakBonus + leagueBonus;
    const newTotalXP = userProfile.xp + totalXP;
    
    // Yeni rank hesapla
    const newRank = this.calculateRank(newTotalXP);
    const newLeague = this.calculateLeague(userProfile.season_xp + totalXP);

    return {
      userId: userProfile.user_id,
      xpEarned: baseXP,
      streakBonus,
      leagueBonus,
      totalXP,
      newRank,
      newLeague,
      badgesEarned: [],
    };
  }

  private async calculateStreakBonus(userId: string): Promise<number> {
    // Son 24 saatte oyun oynadı mı kontrol et
    const { data, error } = await this.supabaseService.supabase
      .from('game_results')
      .select('completed_at')
      .eq('player_id', userId)
      .gte('completed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('completed_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return 0; // Streak yok
    }

    // Streak bonusu hesapla
    const streak = await this.getCurrentStreak(userId);
    return Math.min(streak * 5, 50); // Maksimum 50 XP bonus
  }

  private async getCurrentStreak(userId: string): Promise<number> {
    // Son 7 günlük aktiviteyi kontrol et
    const { data, error } = await this.supabaseService.supabase
      .from('game_results')
      .select('completed_at')
      .eq('player_id', userId)
      .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('completed_at', { ascending: false });

    if (error || !data) return 0;

    // Ardışık günleri say
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      const dayStart = checkDate.toISOString();
      const dayEnd = new Date(checkDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
      
      const hasActivity = data.some(result => 
        result.completed_at >= dayStart && result.completed_at < dayEnd
      );
      
      if (hasActivity) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateLeagueBonus(league: string, baseXP: number): number {
    const leagueMultipliers = {
      'BRONZE': 1.0,
      'SILVER': 1.1,
      'GOLD': 1.2,
      'DIAMOND': 1.3,
    };

    const multiplier = leagueMultipliers[league] || 1.0;
    return Math.floor(baseXP * (multiplier - 1.0));
  }

  private calculateRank(xp: number): string {
    if (xp >= 10000) return 'COMMUNITY_LEADER';
    if (xp >= 5000) return 'EXPERT_COMMENTER';
    if (xp >= 2000) return 'KNOWLEDGE_SHARER';
    if (xp >= 500) return 'ACTIVE_READER';
    return 'NEW_MEMBER';
  }

  private calculateLeague(seasonXP: number): string {
    if (seasonXP >= 5000) return 'DIAMOND';
    if (seasonXP >= 2000) return 'GOLD';
    if (seasonXP >= 1000) return 'SILVER';
    return 'BRONZE';
  }

  private async updateUserProfile(userId: string, progress: UserProgress) {
    const { error } = await this.supabaseService.supabase
      .from('user_profiles')
      .update({
        xp: progress.totalXP || 0,
        current_rank: progress.newRank,
        league: progress.newLeague,
        weekly_xp: 0, // Bu değerler ayrıca hesaplanmalı
        monthly_xp: 0,
        season_xp: 0,
        last_active: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  private async updateStreak(userId: string, gameResult: GameResult) {
    // Streak güncelleme mantığı
    const currentStreak = await this.getCurrentStreak(userId);
    
    await this.supabaseService.supabase
      .from('user_profiles')
      .update({
        current_streak: currentStreak,
        longest_streak: Math.max(currentStreak, 0), // Bu kısım daha karmaşık olabilir
      })
      .eq('user_id', userId);
  }

  private async checkBadges(userId: string, progress: UserProgress): Promise<string[]> {
    // Rozet kontrolü mantığı
    const newBadges: string[] = [];
    
    // Örnek rozet kontrolleri
    if (progress.totalXP >= 1000 && !progress.badgesEarned.includes('FIRST_1000_XP')) {
      newBadges.push('FIRST_1000_XP');
    }
    
    if (progress.newRank === 'COMMUNITY_LEADER' && !progress.badgesEarned.includes('COMMUNITY_LEADER')) {
      newBadges.push('COMMUNITY_LEADER');
    }

    return newBadges;
  }

  private async getUserDailyActivities(userId: string, date: string) {
    const { data, error } = await this.supabaseService.supabase
      .from('game_results')
      .select('*')
      .eq('player_id', userId)
      .gte('completed_at', `${date}T00:00:00`)
      .lte('completed_at', `${date}T23:59:59`);

    if (error) {
      throw new Error(`Failed to fetch daily activities: ${error.message}`);
    }

    return data || [];
  }

  private isTaskCompleted(task: any, activities: any[]): boolean {
    // Görev tamamlama kontrolü
    switch (task.type) {
      case 'PLAY_GAMES':
        return activities.length >= task.target;
      case 'EARN_XP':
        return activities.reduce((sum, a) => sum + a.xp_earned, 0) >= task.target;
      case 'WIN_GAMES':
        return activities.filter(a => a.score > 0).length >= task.target;
      default:
        return false;
    }
  }

  private calculateTaskProgress(task: any, activities: any[]): number {
    // Görev ilerlemesi hesaplama
    switch (task.type) {
      case 'PLAY_GAMES':
        return Math.min(activities.length / task.target, 1);
      case 'EARN_XP':
        const totalXP = activities.reduce((sum, a) => sum + a.xp_earned, 0);
        return Math.min(totalXP / task.target, 1);
      case 'WIN_GAMES':
        const wins = activities.filter(a => a.score > 0).length;
        return Math.min(wins / task.target, 1);
      default:
        return 0;
    }
  }

  private getDefaultUserStats(userId: string) {
    return {
      user_id: userId,
      total_games: 0,
      total_xp: 0,
      win_rate: 0,
      average_score: 0,
      favorite_category: null,
      created_at: new Date().toISOString(),
    };
  }
}

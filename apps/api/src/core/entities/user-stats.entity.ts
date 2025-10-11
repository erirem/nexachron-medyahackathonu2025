/**
 * User stats entity representing the user_stats table
 * Core domain entity for user statistics and gamification
 */

export class UserStatsEntity {
  userId: string;
  xp: number;
  streak: number;
  rankLevel: number;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<UserStatsEntity>) {
    this.userId = data.userId || '';
    this.xp = data.xp || 0;
    this.streak = data.streak || 0;
    this.rankLevel = data.rankLevel || 1;
    this.lastSeen = data.lastSeen;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Get user's rank based on XP
   */
  getRank(): string {
    if (this.xp >= 10000) return 'LEGEND';
    if (this.xp >= 5000) return 'MASTER';
    if (this.xp >= 2500) return 'EXPERT';
    if (this.xp >= 1000) return 'ADVANCED';
    if (this.xp >= 500) return 'INTERMEDIATE';
    if (this.xp >= 100) return 'BEGINNER';
    return 'NEW_MEMBER';
  }

  /**
   * Get user's league based on rank level
   */
  getLeague(): string {
    if (this.rankLevel >= 50) return 'DIAMOND';
    if (this.rankLevel >= 30) return 'PLATINUM';
    if (this.rankLevel >= 20) return 'GOLD';
    if (this.rankLevel >= 10) return 'SILVER';
    return 'BRONZE';
  }

  /**
   * Calculate XP needed for next level
   */
  getXpToNextLevel(): number {
    const currentLevelXp = this.getXpForLevel(this.rankLevel);
    const nextLevelXp = this.getXpForLevel(this.rankLevel + 1);
    return nextLevelXp - this.xp;
  }

  /**
   * Get XP required for a specific level
   */
  private getXpForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.2, level - 1));
  }

  /**
   * Check if user is active (seen within last 7 days)
   */
  isActive(): boolean {
    if (!this.lastSeen) return false;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return this.lastSeen > sevenDaysAgo;
  }

  /**
   * Update last seen timestamp
   */
  updateLastSeen(): void {
    this.lastSeen = new Date();
    this.updatedAt = new Date();
  }
}

export interface CreateUserStatsData {
  userId: string;
  xp?: number;
  streak?: number;
  rankLevel?: number;
  lastSeen?: Date;
}

export interface UpdateUserStatsData {
  xp?: number;
  streak?: number;
  rankLevel?: number;
  lastSeen?: Date;
}

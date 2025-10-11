/**
 * Combined user entity with stats
 * Represents the complete user profile
 */

import { UserEntity } from './user.entity';
import { UserStatsEntity } from './user-stats.entity';

export class UserWithStatsEntity {
  user: UserEntity;
  stats: UserStatsEntity;

  constructor(user: UserEntity, stats: UserStatsEntity) {
    this.user = user;
    this.stats = stats;
  }

  /**
   * Get complete user profile
   */
  getProfile() {
    return {
      id: this.user.id,
      email: this.user.email,
      username: this.user.username,
      city: this.user.city,
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      displayName: this.user.getDisplayName(),
      initials: this.user.getInitials(),
      hasCompleteProfile: this.user.hasCompleteProfile(),
      createdAt: this.user.createdAt,
      updatedAt: this.user.updatedAt,
      // Stats
      xp: this.stats.xp,
      streak: this.stats.streak,
      rankLevel: this.stats.rankLevel,
      rank: this.stats.getRank(),
      league: this.stats.getLeague(),
      xpToNextLevel: this.stats.getXpToNextLevel(),
      isActive: this.stats.isActive(),
      lastSeen: this.stats.lastSeen,
    };
  }

  /**
   * Get user's gamification summary
   */
  getGamificationSummary() {
    return {
      xp: this.stats.xp,
      streak: this.stats.streak,
      rankLevel: this.stats.rankLevel,
      rank: this.stats.getRank(),
      league: this.stats.getLeague(),
      xpToNextLevel: this.stats.getXpToNextLevel(),
      isActive: this.stats.isActive(),
    };
  }

  /**
   * Get user's basic info
   */
  getBasicInfo() {
    return {
      id: this.user.id,
      email: this.user.email,
      username: this.user.username,
      displayName: this.user.getDisplayName(),
      initials: this.user.getInitials(),
      hasCompleteProfile: this.user.hasCompleteProfile(),
    };
  }
}

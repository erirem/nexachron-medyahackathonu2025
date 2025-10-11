export interface GameRecommendation {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'cyan' | 'yellow' | 'red' | 'orange';
  category: 'educational' | 'memory' | 'word' | 'trivia' | 'timeline' | 'visual' | 'arcade';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  estimatedTime: string;
  activePlayerCount: number;
  isRecommendedByAI: boolean;
  aiRecommendationReason?: string;
  hasActiveChallenge: boolean;
  streakContinuation?: {
    currentStreak: number;
    nextReward: number;
  };
  matchedCategories: string[];
  href: string;
}

export interface GameRecommendationConfig {
  maxRecommendationsPerPage: number;
  minSpacingBetweenCards: number;
  aiRecommendationProbability: number;
  playerCountRange: {
    min: number;
    max: number;
  };
}

export interface UserGamePreferences {
  preferredCategories: string[];
  completedGames: string[];
  favoriteGameTypes: string[];
  lastPlayedAt?: Date;
  totalGamesPlayed: number;
}

export const AI_RECOMMENDATION_REASONS = [
  'Son okuma alışkanlıklarına göre önerildi',
  'Oyun geçmişine göre kişiselleştirildi',
  'Aktif olduğun saatlere göre seçildi',
  'İlgi alanlarına göre önerildi',
  'Streak devam ettirmek için önerildi',
  'Yeni deneyim için önerildi'
] as const;

export type AIRecommendationReason = typeof AI_RECOMMENDATION_REASONS[number];

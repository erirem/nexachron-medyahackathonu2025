export enum UserRank {
  NEW_MEMBER = 'NEW_MEMBER',
  ACTIVE_READER = 'ACTIVE_READER',
  KNOWLEDGE_SHARER = 'KNOWLEDGE_SHARER',
  EXPERT_COMMENTER = 'EXPERT_COMMENTER',
  COMMUNITY_LEADER = 'COMMUNITY_LEADER'
}

export enum League {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  DIAMOND = 'DIAMOND'
}

export enum Badge {
  STREAK_3 = 'STREAK_3',
  STREAK_7 = 'STREAK_7',
  STREAK_30 = 'STREAK_30',
  TOP_COMMENTER = 'TOP_COMMENTER',
  TRENDING_FOLLOWER = 'TRENDING_FOLLOWER',
  QUIZ_MASTER = 'QUIZ_MASTER'
}

export enum BadgeType {
  GENERAL = 'GENERAL',
  RARE = 'RARE'
}

export enum BadgeCategory {
  STREAK = 'STREAK',
  QUIZ = 'QUIZ',
  ACHIEVEMENT = 'ACHIEVEMENT',
  SPECIAL = 'SPECIAL'
}

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: BadgeType;
  category: BadgeCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirement: string;
  xpReward: number;
  isEarned: boolean;
  earnedDate?: Date;
  totalEarned?: number; // Kaç kişi kazandı (nadir rozetler için)
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  xp: number;
  currentRank: UserRank;
  league: League;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  badgeInfo: BadgeInfo[]; // Detaylı rozet bilgileri
  streakProtection: number;
  joinDate: Date;
  lastActive: Date;
  followedTopics: string[];
  weeklyXp: number;
  monthlyXp: number;
  seasonXp: number;
}

export interface XPAction {
  type: 'NEWS_READ' | 'COMMENT' | 'QUIZ_COMPLETE' | 'TOPIC_FOLLOW' | 'DAILY_LOGIN' | 'STREAK_BONUS';
  xpAmount: number;
  timestamp: Date;
  description: string;
}

export interface Comment {
  id: string;
  newsId: string;
  userId: string;
  userProfile: {
    name: string;
    avatar?: string;
    rank: UserRank;
    xp: number;
  };
  content: string;
  timestamp: Date;
  likes: number;
  isLikedByUser: boolean;
  xpEarned: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: Date;
  hasCheckedInToday: boolean;
  nextMilestone: number;
  streakProtectionAvailable: number;
}

export interface RankInfo {
  rank: UserRank;
  rankName: string;
  rankEmoji: string;
  nextRank?: UserRank;
  xpToNextRank?: number;
  currentXp: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  rank: UserRank;
  league: League;
  xp: number;
  position: number;
  movement: 'up' | 'down' | 'same';
  movementAmount: number;
}

// XP değerleri
export const XP_VALUES = {
  NEWS_READ: 10,
  COMMENT: 20,
  COMMENT_LIKE: 5,
  QUIZ_COMPLETE: 30,
  TOPIC_FOLLOW: 15,
  DAILY_LOGIN: 5,
  STREAK_3_DAYS: 50,
  STREAK_7_DAYS: 100,
  STREAK_30_DAYS: 500,
  TRENDING_TOPIC_READ: 25
};

// Rank eşikleri
export const RANK_THRESHOLDS = {
  [UserRank.NEW_MEMBER]: 0,
  [UserRank.ACTIVE_READER]: 500,
  [UserRank.KNOWLEDGE_SHARER]: 2000,
  [UserRank.EXPERT_COMMENTER]: 5000,
  [UserRank.COMMUNITY_LEADER]: 10000
};

// Rank bilgileri
export const RANK_INFO = {
  [UserRank.NEW_MEMBER]: {
    name: 'Yeni Katılımcı',
    emoji: '🟢',
    color: 'text-green-400',
    bgColor: 'bg-green-400/20',
    borderColor: 'border-green-400/30'
  },
  [UserRank.ACTIVE_READER]: {
    name: 'Aktif Okur',
    emoji: '🔵',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
    borderColor: 'border-blue-400/30'
  },
  [UserRank.KNOWLEDGE_SHARER]: {
    name: 'Bilgi Paylaşımcısı',
    emoji: '🟡',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
    borderColor: 'border-yellow-400/30'
  },
  [UserRank.EXPERT_COMMENTER]: {
    name: 'Uzman Yorumcu',
    emoji: '🔴',
    color: 'text-red-400',
    bgColor: 'bg-red-400/20',
    borderColor: 'border-red-400/30'
  },
  [UserRank.COMMUNITY_LEADER]: {
    name: 'Topluluk Lideri',
    emoji: '🟣',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
    borderColor: 'border-purple-400/30'
  }
};

// Lig bilgileri
export const LEAGUE_INFO = {
  [League.BRONZE]: {
    name: 'Bronz',
    emoji: '🥉',
    color: 'text-orange-600',
    bgColor: 'bg-orange-600/20',
    borderColor: 'border-orange-600/30'
  },
  [League.SILVER]: {
    name: 'Gümüş',
    emoji: '🥈',
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/20',
    borderColor: 'border-gray-400/30'
  },
  [League.GOLD]: {
    name: 'Altın',
    emoji: '🥇',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
    borderColor: 'border-yellow-400/30'
  },
  [League.DIAMOND]: {
    name: 'Elmas',
    emoji: '💎',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/20',
    borderColor: 'border-cyan-400/30'
  }
};

// Rozet bilgileri
export const BADGE_INFO: BadgeInfo[] = [
  // Genel Rozetler
  {
    id: 'streak_3',
    name: '3 Gün Streak',
    description: '3 gün üst üste giriş yap',
    icon: 'flame',
    type: BadgeType.GENERAL,
    category: BadgeCategory.STREAK,
    rarity: 'common',
    requirement: '3 gün üst üste giriş yap',
    xpReward: 50,
    isEarned: false,
    totalEarned: 1250
  },
  {
    id: 'streak_7',
    name: '7 Gün Streak',
    description: '1 hafta boyunca giriş yap',
    icon: 'calendar-check',
    type: BadgeType.GENERAL,
    category: BadgeCategory.STREAK,
    rarity: 'uncommon',
    requirement: '7 gün üst üste giriş yap',
    xpReward: 100,
    isEarned: false,
    totalEarned: 890
  },
  {
    id: 'streak_30',
    name: '30 Gün Streak',
    description: '1 ay boyunca giriş yap',
    icon: 'trophy',
    type: BadgeType.GENERAL,
    category: BadgeCategory.STREAK,
    rarity: 'rare',
    requirement: '30 gün üst üste giriş yap',
    xpReward: 500,
    isEarned: false,
    totalEarned: 156
  },
  {
    id: 'quiz_master',
    name: 'Quiz Ustası',
    description: '10 quiz\'i doğru çöz',
    icon: 'brain',
    type: BadgeType.GENERAL,
    category: BadgeCategory.QUIZ,
    rarity: 'uncommon',
    requirement: '10 quiz\'i doğru çöz',
    xpReward: 200,
    isEarned: false,
    totalEarned: 423
  },
  {
    id: 'top_commenter',
    name: 'Haftanın Yorumcusu',
    description: 'En çok yorum yapan kullanıcı ol',
    icon: 'message-circle',
    type: BadgeType.GENERAL,
    category: BadgeCategory.ACHIEVEMENT,
    rarity: 'uncommon',
    requirement: 'Haftalık en çok yorum yap',
    xpReward: 150,
    isEarned: false,
    totalEarned: 67
  },
  {
    id: 'trending_follower',
    name: 'Trend Takipçisi',
    description: '5 trend konuyu takip et',
    icon: 'trending-up',
    type: BadgeType.GENERAL,
    category: BadgeCategory.ACHIEVEMENT,
    rarity: 'common',
    requirement: '5 trend konuyu takip et',
    xpReward: 75,
    isEarned: false,
    totalEarned: 892
  },
  
  // Nadir Rozetler
  {
    id: 'first_1000',
    name: 'İlk 1000',
    description: 'Platforma ilk 1000 kullanıcıdan biri ol',
    icon: 'crown',
    type: BadgeType.RARE,
    category: BadgeCategory.SPECIAL,
    rarity: 'legendary',
    requirement: 'İlk 1000 kullanıcıdan biri ol',
    xpReward: 1000,
    isEarned: false,
    totalEarned: 1000
  },
  {
    id: 'perfect_week',
    name: 'Mükemmel Hafta',
    description: '7 gün boyunca her gün en az 100 XP kazan',
    icon: 'star',
    type: BadgeType.RARE,
    category: BadgeCategory.ACHIEVEMENT,
    rarity: 'epic',
    requirement: '7 gün boyunca her gün 100+ XP kazan',
    xpReward: 750,
    isEarned: false,
    totalEarned: 23
  },
  {
    id: 'quiz_legend',
    name: 'Quiz Efsanesi',
    description: '50 quiz\'i %100 doğru çöz',
    icon: 'target',
    type: BadgeType.RARE,
    category: BadgeCategory.QUIZ,
    rarity: 'epic',
    requirement: '50 quiz\'i %100 doğru çöz',
    xpReward: 800,
    isEarned: false,
    totalEarned: 12
  },
  {
    id: 'news_explorer',
    name: 'Haber Kaşifi',
    description: '100 farklı kategoriden haber oku',
    icon: 'map',
    type: BadgeType.RARE,
    category: BadgeCategory.ACHIEVEMENT,
    rarity: 'rare',
    requirement: '100 farklı kategoriden haber oku',
    xpReward: 400,
    isEarned: false,
    totalEarned: 45
  },
  {
    id: 'community_champion',
    name: 'Topluluk Şampiyonu',
    description: 'Aylık liderlik tablosunda 1. ol',
    icon: 'award',
    type: BadgeType.RARE,
    category: BadgeCategory.ACHIEVEMENT,
    rarity: 'legendary',
    requirement: 'Aylık liderlik tablosunda 1. ol',
    xpReward: 1500,
    isEarned: false,
    totalEarned: 3
  },
  {
    id: 'streak_100',
    name: '100 Gün Streak',
    description: '100 gün üst üste giriş yap',
    icon: 'zap',
    type: BadgeType.RARE,
    category: BadgeCategory.STREAK,
    rarity: 'legendary',
    requirement: '100 gün üst üste giriş yap',
    xpReward: 2000,
    isEarned: false,
    totalEarned: 1
  }
];
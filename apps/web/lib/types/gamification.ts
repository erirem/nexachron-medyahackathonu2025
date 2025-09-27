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
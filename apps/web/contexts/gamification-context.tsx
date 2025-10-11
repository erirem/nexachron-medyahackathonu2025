'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { 
  UserProfile, 
  UserRank, 
  League, 
  Badge, 
  XPAction, 
  StreakInfo,
  DailyActivity,
  WeeklyActivity,
  MonthlyActivity,
  XP_VALUES,
  RANK_THRESHOLDS,
  BADGE_INFO,
  BadgeType
} from '@/lib/types/gamification';

interface GamificationContextType {
  userProfile: UserProfile | null;
  addXP: (type: XPAction['type'], customXP?: number) => void;
  checkStreak: () => void;
  followTopic: (topic: string) => void;
  unfollowTopic: (topic: string) => void;
  useStreakProtection: () => boolean;
  getStreakInfo: () => StreakInfo;
  completeQuiz: (quizId: string, score: number, totalQuestions: number) => void;
  trackActivity: (type: 'news_read' | 'comment' | 'quiz_complete' | 'topic_follow') => void;
  getDailyActivity: () => DailyActivity;
  getWeeklyActivity: () => WeeklyActivity;
  getMonthlyActivity: () => MonthlyActivity;
  completeNews: (newsId: string) => void;
  completeSpeedRead: (newsId: string) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

// Mock user profile - gerçekte bu veriler Supabase'den gelecek
const MOCK_USER_PROFILE: UserProfile = {
  id: 'user-123',
  email: 'user@example.com',
  name: 'Ahmet Yılmaz',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  xp: 1250,
  currentRank: UserRank.ACTIVE_READER,
  league: League.SILVER,
  currentStreak: 5,
  longestStreak: 12,
  badges: [Badge.STREAK_3, Badge.STREAK_7],
  badgeInfo: BADGE_INFO.map(badge => ({
    ...badge,
    isEarned: [
      'streak_3', 'streak_7', 'quiz_master', 'trending_follower', // Genel rozetler
      'first_1000', 'perfect_week', 'news_explorer' // Nadir rozetler
    ].includes(badge.id),
    earnedDate: [
      'streak_3', 'streak_7', 'quiz_master', 'trending_follower',
      'first_1000', 'perfect_week', 'news_explorer'
    ].includes(badge.id) ? new Date('2024-01-20') : undefined
  })),
  streakProtection: 2,
  joinDate: new Date('2024-01-15'),
  lastActive: new Date(),
  followedTopics: ['Teknoloji', 'Ekonomi'],
  weeklyXp: 320,
  monthlyXp: 1250,
  seasonXp: 1250,
  dailyActivity: {
    date: new Date(),
    newsRead: 3,
    commentsMade: 1,
    quizzesCompleted: 0,
    xpEarned: 45,
    topicsFollowed: 5,
    streakDays: 5,
    categoryStats: [
      {
        categoryId: 'tech',
        categoryName: 'Teknoloji',
        newsRead: 2,
        totalTimeSpent: 15,
        lastReadDate: new Date(),
        favoriteTimeOfDay: 'morning'
      },
      {
        categoryId: 'economy',
        categoryName: 'Ekonomi',
        newsRead: 1,
        totalTimeSpent: 8,
        lastReadDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        favoriteTimeOfDay: 'afternoon'
      }
    ]
  },
  weeklyActivity: {
    weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    weekEnd: new Date(),
    newsRead: 15,
    commentsMade: 8,
    quizzesCompleted: 3,
    xpEarned: 320,
    topicsFollowed: 5,
    streakDays: 5,
    dailyActivities: [],
    categoryStats: [
      {
        categoryId: 'tech',
        categoryName: 'Teknoloji',
        newsRead: 8,
        totalTimeSpent: 120,
        lastReadDate: new Date(),
        favoriteTimeOfDay: 'morning'
      },
      {
        categoryId: 'economy',
        categoryName: 'Ekonomi',
        newsRead: 4,
        totalTimeSpent: 60,
        lastReadDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        favoriteTimeOfDay: 'afternoon'
      },
      {
        categoryId: 'sports',
        categoryName: 'Spor',
        newsRead: 2,
        totalTimeSpent: 30,
        lastReadDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        favoriteTimeOfDay: 'evening'
      },
      {
        categoryId: 'politics',
        categoryName: 'Siyaset',
        newsRead: 1,
        totalTimeSpent: 15,
        lastReadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        favoriteTimeOfDay: 'morning'
      }
    ]
  },
  monthlyActivity: {
    monthStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    monthEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    newsRead: 65,
    commentsMade: 32,
    quizzesCompleted: 12,
    xpEarned: 1250,
    topicsFollowed: 5,
    streakDays: 5,
    weeklyActivities: [],
    categoryStats: [
      {
        categoryId: 'tech',
        categoryName: 'Teknoloji',
        newsRead: 35,
        totalTimeSpent: 525,
        lastReadDate: new Date(),
        favoriteTimeOfDay: 'morning'
      },
      {
        categoryId: 'economy',
        categoryName: 'Ekonomi',
        newsRead: 18,
        totalTimeSpent: 270,
        lastReadDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        favoriteTimeOfDay: 'afternoon'
      },
      {
        categoryId: 'sports',
        categoryName: 'Spor',
        newsRead: 8,
        totalTimeSpent: 120,
        lastReadDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        favoriteTimeOfDay: 'evening'
      },
      {
        categoryId: 'politics',
        categoryName: 'Siyaset',
        newsRead: 4,
        totalTimeSpent: 60,
        lastReadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        favoriteTimeOfDay: 'morning'
      }
    ]
  }
};

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(MOCK_USER_PROFILE);
  const [xpAnimations, setXpAnimations] = useState<Array<{id: string, xp: number, timestamp: number}>>([]);

  // XP ekleme animasyonu için
  const showXPAnimation = useCallback((xp: number) => {
    const id = Date.now().toString();
    setXpAnimations(prev => [...prev, { id, xp, timestamp: Date.now() }]);
    
    setTimeout(() => {
      setXpAnimations(prev => prev.filter(anim => anim.id !== id));
    }, 3000);
  }, []);

  // Rank hesaplama
  const calculateRank = useCallback((xp: number): UserRank => {
    if (xp >= RANK_THRESHOLDS[UserRank.COMMUNITY_LEADER]) return UserRank.COMMUNITY_LEADER;
    if (xp >= RANK_THRESHOLDS[UserRank.EXPERT_COMMENTER]) return UserRank.EXPERT_COMMENTER;
    if (xp >= RANK_THRESHOLDS[UserRank.KNOWLEDGE_SHARER]) return UserRank.KNOWLEDGE_SHARER;
    if (xp >= RANK_THRESHOLDS[UserRank.ACTIVE_READER]) return UserRank.ACTIVE_READER;
    return UserRank.NEW_MEMBER;
  }, []);

  // Lig hesaplama (sezonluk XP'ye göre)
  const calculateLeague = useCallback((seasonXp: number): League => {
    if (seasonXp >= 5000) return League.DIAMOND;
    if (seasonXp >= 2500) return League.GOLD;
    if (seasonXp >= 1000) return League.SILVER;
    return League.BRONZE;
  }, []);

  // XP ekleme
  const addXP = useCallback((type: XPAction['type'], customXP?: number) => {
    const xpAmount = customXP ?? (type === 'STREAK_BONUS' ? 0 : XP_VALUES[type]) ?? 0;

    if (xpAmount <= 0) {
      return;
    }

    let shouldAnimate = false;

    setUserProfile(prev => {
      if (!prev) return prev;

      shouldAnimate = true;

      const newXP = prev.xp + xpAmount;
      const newWeeklyXP = prev.weeklyXp + xpAmount;
      const newMonthlyXP = prev.monthlyXp + xpAmount;
      const newSeasonXP = prev.seasonXp + xpAmount;

      const newRank = calculateRank(newXP);
      const newLeague = calculateLeague(newSeasonXP);

      const newBadges = [...prev.badges];

      if (type === 'STREAK_BONUS') {
        if (prev.currentStreak >= 3 && !newBadges.includes(Badge.STREAK_3)) {
          newBadges.push(Badge.STREAK_3);
        }
        if (prev.currentStreak >= 7 && !newBadges.includes(Badge.STREAK_7)) {
          newBadges.push(Badge.STREAK_7);
        }
        if (prev.currentStreak >= 30 && !newBadges.includes(Badge.STREAK_30)) {
          newBadges.push(Badge.STREAK_30);
        }
      }

      return {
        ...prev,
        xp: newXP,
        weeklyXp: newWeeklyXP,
        monthlyXp: newMonthlyXP,
        seasonXp: newSeasonXP,
        currentRank: newRank,
        league: newLeague,
        badges: newBadges
      };
    });

    if (shouldAnimate) {
      showXPAnimation(xpAmount);
    }
  }, [showXPAnimation, calculateRank, calculateLeague]);

  // Streak kontrolü
  const checkStreak = useCallback(() => {
    let streakBonusXP = 0;
    let shouldGrantDailyXP = false;

    setUserProfile(prev => {
      if (!prev) return prev;

      const now = new Date();
      const lastActive = new Date(prev.lastActive);
      const daysSinceLastActive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceLastActive === 0) {
        return prev;
      }

      shouldGrantDailyXP = true;

      if (daysSinceLastActive === 1) {
        const newStreak = prev.currentStreak + 1;

        if (newStreak === 3) {
          streakBonusXP = XP_VALUES.STREAK_3_DAYS;
        } else if (newStreak === 7) {
          streakBonusXP = XP_VALUES.STREAK_7_DAYS;
        } else if (newStreak === 30) {
          streakBonusXP = XP_VALUES.STREAK_30_DAYS;
        }

        return {
          ...prev,
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, prev.longestStreak),
          lastActive: now
        };
      }

      return {
        ...prev,
        currentStreak: 1,
        lastActive: now
      };
    });

    if (streakBonusXP > 0) {
      addXP('STREAK_BONUS', streakBonusXP);
    }

    if (shouldGrantDailyXP) {
      addXP('DAILY_LOGIN');
    }
  }, [addXP]);

  // Konu takibi
  const followTopic = (topic: string) => {
    if (!userProfile || userProfile.followedTopics.includes(topic)) return;

    setUserProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        followedTopics: [...prev.followedTopics, topic]
      };
    });

    addXP('TOPIC_FOLLOW');
  };

  const unfollowTopic = (topic: string) => {
    if (!userProfile) return;

    setUserProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        followedTopics: prev.followedTopics.filter(t => t !== topic)
      };
    });
  };

  // Streak protection kullanma
  const useStreakProtection = (): boolean => {
    if (!userProfile || userProfile.streakProtection <= 0) return false;

    setUserProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        streakProtection: prev.streakProtection - 1
      };
    });

    return true;
  };

  // Streak bilgisi
  const getStreakInfo = (): StreakInfo => {
    if (!userProfile) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastCheckIn: new Date(),
        hasCheckedInToday: false,
        nextMilestone: 3,
        streakProtectionAvailable: 0
      };
    }

    const now = new Date();
    const lastActive = new Date(userProfile.lastActive);
    const daysSinceLastActive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    let nextMilestone = 3;
    if (userProfile.currentStreak >= 30) nextMilestone = 0;
    else if (userProfile.currentStreak >= 7) nextMilestone = 30;
    else if (userProfile.currentStreak >= 3) nextMilestone = 7;

    return {
      currentStreak: userProfile.currentStreak,
      longestStreak: userProfile.longestStreak,
      lastCheckIn: lastActive,
      hasCheckedInToday: daysSinceLastActive === 0,
      nextMilestone,
      streakProtectionAvailable: userProfile.streakProtection
    };
  };

  // Quiz tamamlama
  const completeQuiz = useCallback((quizId: string, score: number, totalQuestions: number) => {
    if (!userProfile) return;

    const correctRatio = score / totalQuestions;
    
    // Minimum %50 doğru cevap gerekli
    if (correctRatio < 0.5) {
      console.log('Quiz başarısız: %50\'den az doğru cevap');
      return;
    }

    // XP hesaplama - doğru cevap oranına göre
    const baseXP = XP_VALUES.QUIZ_COMPLETE;
    const xpEarned = Math.floor(baseXP * correctRatio);
    
    // Bonus XP - mükemmel skor için
    let bonusXP = 0;
    if (correctRatio === 1) {
      bonusXP = Math.floor(baseXP * 0.5); // %50 bonus
    } else if (correctRatio >= 0.8) {
      bonusXP = Math.floor(baseXP * 0.25); // %25 bonus
    }

    const totalXP = xpEarned + bonusXP;

    // XP ekle
    addXP('QUIZ_COMPLETE', totalXP);

    // Quiz ustası rozetini kontrol et
    setUserProfile(prev => {
      if (!prev) return prev;

      const newBadges = [...prev.badges];
      
      // Quiz ustası rozeti için 10 quiz tamamlama gerekli
      // Bu gerçek uygulamada veritabanından kontrol edilecek
      const completedQuizzes = 5; // Mock data - gerçekte veritabanından gelecek
      if (completedQuizzes >= 10 && !newBadges.includes(Badge.QUIZ_MASTER)) {
        newBadges.push(Badge.QUIZ_MASTER);
      }

      return {
        ...prev,
        badges: newBadges
      };
    });

    console.log(`Quiz tamamlandı: ${quizId}, Skor: ${score}/${totalQuestions}, XP: ${totalXP}`);
    trackActivity('quiz_complete');
  }, [userProfile, addXP]);

  // Aktivite takibi
  const trackActivity = useCallback((type: 'news_read' | 'comment' | 'quiz_complete' | 'topic_follow') => {
    setUserProfile(prev => {
      if (!prev) return prev;
      
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      
      // Günlük aktiviteyi güncelle
      const updatedDailyActivity = { ...prev.dailyActivity };
      if (updatedDailyActivity.date.getTime() !== today.getTime()) {
        // Yeni gün başladıysa sıfırla
        updatedDailyActivity.date = today;
        updatedDailyActivity.newsRead = 0;
        updatedDailyActivity.commentsMade = 0;
        updatedDailyActivity.quizzesCompleted = 0;
        updatedDailyActivity.xpEarned = 0;
        updatedDailyActivity.topicsFollowed = prev.followedTopics.length;
        updatedDailyActivity.streakDays = prev.currentStreak;
      }
      
      // Haftalık aktiviteyi güncelle
      const updatedWeeklyActivity = { ...prev.weeklyActivity };
      if (now > weekEnd) {
        // Yeni hafta başladıysa sıfırla
        updatedWeeklyActivity.weekStart = weekStart;
        updatedWeeklyActivity.weekEnd = weekEnd;
        updatedWeeklyActivity.newsRead = 0;
        updatedWeeklyActivity.commentsMade = 0;
        updatedWeeklyActivity.quizzesCompleted = 0;
        updatedWeeklyActivity.xpEarned = 0;
        updatedWeeklyActivity.topicsFollowed = prev.followedTopics.length;
        updatedWeeklyActivity.streakDays = prev.currentStreak;
        updatedWeeklyActivity.dailyActivities = [];
      }
      
      // Aylık aktiviteyi güncelle
      const updatedMonthlyActivity = { ...prev.monthlyActivity };
      if (now > monthEnd) {
        // Yeni ay başladıysa sıfırla
        updatedMonthlyActivity.monthStart = monthStart;
        updatedMonthlyActivity.monthEnd = monthEnd;
        updatedMonthlyActivity.newsRead = 0;
        updatedMonthlyActivity.commentsMade = 0;
        updatedMonthlyActivity.quizzesCompleted = 0;
        updatedMonthlyActivity.xpEarned = 0;
        updatedMonthlyActivity.topicsFollowed = prev.followedTopics.length;
        updatedMonthlyActivity.streakDays = prev.currentStreak;
        updatedMonthlyActivity.weeklyActivities = [];
      }
      
      // Aktivite tipine göre sayacı artır
      switch (type) {
        case 'news_read':
          updatedDailyActivity.newsRead += 1;
          updatedWeeklyActivity.newsRead += 1;
          updatedMonthlyActivity.newsRead += 1;
          break;
        case 'comment':
          updatedDailyActivity.commentsMade += 1;
          updatedWeeklyActivity.commentsMade += 1;
          updatedMonthlyActivity.commentsMade += 1;
          break;
        case 'quiz_complete':
          updatedDailyActivity.quizzesCompleted += 1;
          updatedWeeklyActivity.quizzesCompleted += 1;
          updatedMonthlyActivity.quizzesCompleted += 1;
          break;
        case 'topic_follow':
          updatedDailyActivity.topicsFollowed = prev.followedTopics.length;
          updatedWeeklyActivity.topicsFollowed = prev.followedTopics.length;
          updatedMonthlyActivity.topicsFollowed = prev.followedTopics.length;
          break;
      }
      
      return {
        ...prev,
        dailyActivity: updatedDailyActivity,
        weeklyActivity: updatedWeeklyActivity,
        monthlyActivity: updatedMonthlyActivity
      };
    });
  }, []);

  // Günlük aktivite getir
  const getDailyActivity = useCallback((): DailyActivity => {
    if (!userProfile) {
      return {
        date: new Date(),
        newsRead: 0,
        commentsMade: 0,
        quizzesCompleted: 0,
        xpEarned: 0,
        topicsFollowed: 0,
        streakDays: 0
      };
    }
    
    return userProfile.dailyActivity;
  }, [userProfile]);

  // Haftalık aktivite getir
  const getWeeklyActivity = useCallback((): WeeklyActivity => {
    if (!userProfile) {
      return {
        weekStart: new Date(),
        weekEnd: new Date(),
        newsRead: 0,
        commentsMade: 0,
        quizzesCompleted: 0,
        xpEarned: 0,
        topicsFollowed: 0,
        streakDays: 0,
        dailyActivities: []
      };
    }
    
    return userProfile.weeklyActivity;
  }, [userProfile]);

  // Aylık aktivite getir
  const getMonthlyActivity = useCallback((): MonthlyActivity => {
    if (!userProfile) {
      return {
        monthStart: new Date(),
        monthEnd: new Date(),
        newsRead: 0,
        commentsMade: 0,
        quizzesCompleted: 0,
        xpEarned: 0,
        topicsFollowed: 0,
        streakDays: 0,
        weeklyActivities: []
      };
    }
    
    return userProfile.monthlyActivity;
  }, [userProfile]);
  // Haber tamamlama
  const completeNews = useCallback((newsId: string) => {
    if (!userProfile) return;

    // XP ekle
    addXP('NEWS_COMPLETE');

    // Haber kaşifi rozetini kontrol et
    setUserProfile(prev => {
      if (!prev) return prev;

      const newBadges = [...prev.badges];
      
      // Haber kaşifi rozeti için 100 farklı kategoriden haber okuma gerekli
      // Bu gerçek uygulamada veritabanından kontrol edilecek
      const completedNewsCount = 15; // Mock data - gerçekte veritabanından gelecek
      if (completedNewsCount >= 100 && !newBadges.includes(Badge.TRENDING_FOLLOWER)) {
        newBadges.push(Badge.TRENDING_FOLLOWER);
      }

      return {
        ...prev,
        badges: newBadges
      };
    });

    console.log(`Haber tamamlandı: ${newsId}, XP: ${XP_VALUES.NEWS_COMPLETE}`);
  }, [userProfile, addXP]);

  // Hızlı okuma tamamlama
  const completeSpeedRead = useCallback((newsId: string) => {
    if (!userProfile) return;

    // XP ekle
    addXP('SPEED_READ');

    // Hızlı okur rozetini kontrol et
    setUserProfile(prev => {
      if (!prev) return prev;

      const newBadges = [...prev.badges];
      
      // Hızlı okur rozeti için zaman sınırlı haber okuma
      if (!newBadges.includes(Badge.SPEED_READER)) {
        newBadges.push(Badge.SPEED_READER);
      }

      return {
        ...prev,
        badges: newBadges
      };
    });

    console.log(`Hızlı okuma tamamlandı: ${newsId}, XP: ${XP_VALUES.SPEED_READ}`);
  }, [userProfile, addXP]);

  // Component mount olduğunda streak kontrol et
  useEffect(() => {
    checkStreak();
  }, [checkStreak]);

  // Streak bonusu hesapla
  const calculateStreakBonus = useCallback((streakDays: number): number => {
    if (streakDays === 0) return 0;
    if (streakDays < 7) return streakDays * 5;
    if (streakDays < 30) return streakDays * 10;
    return streakDays * 20;
  }, []);

  return (
    <GamificationContext.Provider value={{
      userProfile,
      addXP,
      checkStreak,
      followTopic,
      unfollowTopic,
      useStreakProtection,
      getStreakInfo,
      completeQuiz,
      trackActivity,
      getDailyActivity,
      getWeeklyActivity,
      getMonthlyActivity,
      completeNews,
      completeSpeedRead
    }}>
      {children}
      {/* XP Animasyonları */}
      <div className="fixed top-20 right-4 z-[100] pointer-events-none">
        {xpAnimations.map(anim => (
          <div
            key={anim.id}
            className="animate-in slide-in-from-bottom-4 fade-in duration-500 animate-out slide-out-to-top-8 fade-out duration-1000"
            style={{ animationDelay: '2s' }}
          >
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
              +{anim.xp} XP
            </div>
          </div>
        ))}
      </div>
    </GamificationContext.Provider>
  );
}

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

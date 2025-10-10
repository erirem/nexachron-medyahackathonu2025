'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { 
  UserProfile, 
  DailyActivity,
  WeeklyActivity, 
  MonthlyActivity,
  PersonalAnalyst, 
  UserRank, 
  RANK_THRESHOLDS, 
  RANK_INFO 
} from '@/lib/types/gamification';

interface PersonalAnalystContextType {
  personalAnalyst: PersonalAnalyst | null;
  generateAnalysis: (userProfile: UserProfile) => PersonalAnalyst;
  getMotivationalMessage: (stats: DailyActivity | WeeklyActivity | MonthlyActivity, currentRank: UserRank, period: 'daily' | 'weekly' | 'monthly') => string;
  getRecommendations: (stats: DailyActivity | WeeklyActivity | MonthlyActivity, currentRank: UserRank, period: 'daily' | 'weekly' | 'monthly') => string[];
  getAchievements: (stats: DailyActivity | WeeklyActivity | MonthlyActivity, userProfile: UserProfile, period: 'daily' | 'weekly' | 'monthly') => string[];
}

const PersonalAnalystContext = createContext<PersonalAnalystContextType | undefined>(undefined);

export function PersonalAnalystProvider({ children }: { children: ReactNode }) {
  const [personalAnalyst, setPersonalAnalyst] = useState<PersonalAnalyst | null>(null);

  // Analiz oluştur
  const generateAnalysis = useCallback((userProfile: UserProfile): PersonalAnalyst => {
    const dailyStats = userProfile.dailyActivity;
    const weeklyStats = userProfile.weeklyActivity;
    const monthlyStats = userProfile.monthlyActivity;

    const achievements = getAchievements(weeklyStats, userProfile, 'weekly');
    const nextRankProgress = getNextRankProgress(userProfile);
    const motivationalMessage = getMotivationalMessage(weeklyStats, userProfile.currentRank, 'weekly');
    const recommendations = getRecommendations(weeklyStats, userProfile.currentRank, 'weekly');
    
    const dailyGoal = {
      target: getDailyGoal(userProfile.currentRank),
      current: dailyStats.xpEarned,
      percentage: Math.min(100, Math.round((dailyStats.xpEarned / getDailyGoal(userProfile.currentRank)) * 100))
    };

    const weeklyGoal = {
      target: getWeeklyGoal(userProfile.currentRank),
      current: weeklyStats.xpEarned,
      percentage: Math.min(100, Math.round((weeklyStats.xpEarned / getWeeklyGoal(userProfile.currentRank)) * 100))
    };

    const monthlyGoal = {
      target: getMonthlyGoal(userProfile.currentRank),
      current: monthlyStats.xpEarned,
      percentage: Math.min(100, Math.round((monthlyStats.xpEarned / getMonthlyGoal(userProfile.currentRank)) * 100))
    };

    return {
      dailyStats,
      weeklyStats,
      monthlyStats,
      achievements,
      nextRankProgress,
      motivationalMessage,
      recommendations,
      dailyGoal,
      weeklyGoal,
      monthlyGoal
    };
  }, []);

  // Motivasyonel mesaj oluştur
  const getMotivationalMessage = useCallback((stats: DailyActivity | WeeklyActivity | MonthlyActivity, currentRank: UserRank, period: 'daily' | 'weekly' | 'monthly'): string => {
    const periodText = period === 'daily' ? 'bugün' : period === 'weekly' ? 'bu hafta' : 'bu ay';
    
    // Özel durumlar için mesajlar (yüksek öncelik)
    if (stats.newsRead >= (period === 'daily' ? 5 : period === 'weekly' ? 20 : 80)) {
      return `WOW! ${periodText.charAt(0).toUpperCase() + periodText.slice(1)} ${stats.newsRead} haber okudun! Sen gerçek bir haber tutkunusun!`;
    }
    
    if (stats.commentsMade >= (period === 'daily' ? 2 : period === 'weekly' ? 10 : 40)) {
      return `Harika! ${periodText} ${stats.commentsMade} yorumla topluluğa büyük katkı sağladın!`;
    }
    
    if (stats.xpEarned >= (period === 'daily' ? 50 : period === 'weekly' ? 500 : 2000)) {
      return `İnanılmaz! ${periodText.charAt(0).toUpperCase() + periodText.slice(1)} ${stats.xpEarned} XP kazandın! Sen bir XP makinesisin!`;
    }

    if (stats.newsRead === 0) {
      return `${periodText.charAt(0).toUpperCase() + periodText.slice(1)} henüz haber okumamışsın. Hadi başlayalım! İlk haberini oku ve XP kazanmaya başla!`;
    }

    // Deterministic message selection based on user data
    const messages = [
      `${periodText.charAt(0).toUpperCase() + periodText.slice(1)} ${stats.newsRead} haber okudun, ${stats.commentsMade} yorum yaptın ve ${stats.xpEarned} XP kazandın!`,
      `Harika! ${periodText} ${stats.newsRead} haber okuyarak bilgini genişlettin ve ${stats.xpEarned} XP kazandın.`,
      `${periodText.charAt(0).toUpperCase() + periodText.slice(1)} ${stats.newsRead} haber okudun ve ${stats.commentsMade} yorumla topluluğa katkıda bulundun!`,
      `Mükemmel! ${periodText} ${stats.xpEarned} XP kazanarak ${RANK_INFO[currentRank].name} rütbende ilerliyorsun.`,
      `${periodText.charAt(0).toUpperCase() + periodText.slice(1)} ${stats.newsRead} haber okudun, ${stats.commentsMade} yorum yaptın ve ${stats.quizzesCompleted} quiz tamamladın!`
    ];

    // Use a deterministic selection based on user data instead of random
    const dataHash = (stats.newsRead + stats.commentsMade + stats.xpEarned + stats.quizzesCompleted) % messages.length;
    return messages[dataHash];
  }, []);

  // Öneriler oluştur
  const getRecommendations = useCallback((stats: DailyActivity | WeeklyActivity | MonthlyActivity, currentRank: UserRank, period: 'daily' | 'weekly' | 'monthly'): string[] => {
    const recommendations: string[] = [];
    const periodText = period === 'daily' ? 'günlük' : period === 'weekly' ? 'haftalık' : 'aylık';
    
    const thresholds = {
      daily: { news: 2, comments: 1, quizzes: 1, topics: 1, streak: 1 },
      weekly: { news: 5, comments: 3, quizzes: 2, topics: 3, streak: 3 },
      monthly: { news: 20, comments: 10, quizzes: 8, topics: 5, streak: 7 }
    };
    
    const threshold = thresholds[period];

    if (stats.newsRead < threshold.news) {
      recommendations.push(`Daha fazla haber okuyarak bilgini genişlet ve ${periodText} hedefine ulaş!`);
    }
    
    if (stats.commentsMade < threshold.comments) {
      recommendations.push('Yorum yaparak topluluğa katkıda bulun ve ekstra XP kazan!');
    }
    
    if (stats.quizzesCompleted < threshold.quizzes) {
      recommendations.push('Quiz oyunlarını oynayarak bilgini test et ve büyük XP ödülleri kazan!');
    }
    
    if (stats.topicsFollowed < threshold.topics) {
      recommendations.push('İlgi alanlarını takip ederek kişiselleştirilmiş içerik al!');
    }
    
    if (stats.streakDays < threshold.streak) {
      recommendations.push('Günlük giriş yaparak streak\'ini artır ve bonus XP kazan!');
    }

    if (recommendations.length === 0) {
      recommendations.push('Mükemmel performans! Bu tempoda devam et!');
    }

    return recommendations;
  }, []);

  // Başarılar oluştur
  const getAchievements = useCallback((stats: DailyActivity | WeeklyActivity | MonthlyActivity, userProfile: UserProfile, period: 'daily' | 'weekly' | 'monthly'): string[] => {
    const achievements: string[] = [];
    const periodText = period === 'daily' ? 'günlük' : period === 'weekly' ? 'haftalık' : 'aylık';
    
    const thresholds = {
      daily: { news: [3, 5], comments: [2, 5], xp: [30, 50], quizzes: [1, 3], streak: [1, 3] },
      weekly: { news: [10, 20], comments: [5, 10], xp: [200, 500], quizzes: [2, 5], streak: [3, 7] },
      monthly: { news: [40, 80], comments: [20, 40], xp: [800, 2000], quizzes: [8, 15], streak: [7, 15] }
    };
    
    const threshold = thresholds[period];

    if (stats.newsRead >= threshold.news[1]) {
      achievements.push(`Haber Tutkunu - ${periodText} ${stats.newsRead}+ haber okudun!`);
    } else if (stats.newsRead >= threshold.news[0]) {
      achievements.push(`Aktif Okur - ${periodText} ${stats.newsRead}+ haber okudun!`);
    }

    if (stats.commentsMade >= threshold.comments[1]) {
      achievements.push(`Topluluk Lideri - ${periodText} ${stats.commentsMade}+ yorum yaptın!`);
    } else if (stats.commentsMade >= threshold.comments[0]) {
      achievements.push(`Sosyal Katılımcı - ${periodText} ${stats.commentsMade}+ yorum yaptın!`);
    }

    if (stats.xpEarned >= threshold.xp[1]) {
      achievements.push(`XP Şampiyonu - ${periodText} ${stats.xpEarned}+ XP kazandın!`);
    } else if (stats.xpEarned >= threshold.xp[0]) {
      achievements.push(`XP Toplayıcı - ${periodText} ${stats.xpEarned}+ XP kazandın!`);
    }

    if (stats.quizzesCompleted >= threshold.quizzes[1]) {
      achievements.push(`Quiz Ustası - ${periodText} ${stats.quizzesCompleted}+ quiz tamamladın!`);
    } else if (stats.quizzesCompleted >= threshold.quizzes[0]) {
      achievements.push(`Quiz Sever - ${periodText} ${stats.quizzesCompleted}+ quiz tamamladın!`);
    }

    if (stats.streakDays >= threshold.streak[1]) {
      achievements.push(`Streak Ustası - ${stats.streakDays}+ gün üst üste giriş!`);
    } else if (stats.streakDays >= threshold.streak[0]) {
      achievements.push(`Streak Başlangıcı - ${stats.streakDays}+ gün üst üste giriş!`);
    }

    return achievements;
  }, []);

  // Sonraki rütbe ilerlemesi
  const getNextRankProgress = useCallback((userProfile: UserProfile) => {
    const ranks = Object.values(UserRank);
    const currentIndex = ranks.indexOf(userProfile.currentRank);
    
    if (currentIndex === -1 || currentIndex === ranks.length - 1) {
      return {
        currentRank: userProfile.currentRank,
        nextRank: userProfile.currentRank,
        xpToNext: 0,
        progressPercentage: 100
      };
    }

    const nextRank = ranks[currentIndex + 1] as UserRank;
    const currentRankThreshold = RANK_THRESHOLDS[userProfile.currentRank];
    const nextRankThreshold = RANK_THRESHOLDS[nextRank];
    const xpNeededForNextRank = nextRankThreshold - currentRankThreshold;
    const xpEarnedInCurrentRank = userProfile.xp - currentRankThreshold;
    const progressPercentage = xpNeededForNextRank > 0 ? Math.min(100, Math.round((xpEarnedInCurrentRank / xpNeededForNextRank) * 100)) : 100;
    const xpToNext = nextRankThreshold - userProfile.xp;

    return {
      currentRank: userProfile.currentRank,
      nextRank: nextRank,
      xpToNext: Math.max(0, xpToNext),
      progressPercentage
    };
  }, []);

  // Günlük hedef hesapla
  const getDailyGoal = useCallback((currentRank: UserRank): number => {
    const goals = {
      [UserRank.NEW_MEMBER]: 15,
      [UserRank.ACTIVE_READER]: 25,
      [UserRank.KNOWLEDGE_SHARER]: 40,
      [UserRank.EXPERT_COMMENTER]: 60,
      [UserRank.COMMUNITY_LEADER]: 80
    };
    
    return goals[currentRank] || 15;
  }, []);

  // Haftalık hedef hesapla
  const getWeeklyGoal = useCallback((currentRank: UserRank): number => {
    const goals = {
      [UserRank.NEW_MEMBER]: 100,
      [UserRank.ACTIVE_READER]: 200,
      [UserRank.KNOWLEDGE_SHARER]: 350,
      [UserRank.EXPERT_COMMENTER]: 500,
      [UserRank.COMMUNITY_LEADER]: 750
    };
    
    return goals[currentRank] || 100;
  }, []);

  // Aylık hedef hesapla
  const getMonthlyGoal = useCallback((currentRank: UserRank): number => {
    const goals = {
      [UserRank.NEW_MEMBER]: 400,
      [UserRank.ACTIVE_READER]: 800,
      [UserRank.KNOWLEDGE_SHARER]: 1400,
      [UserRank.EXPERT_COMMENTER]: 2000,
      [UserRank.COMMUNITY_LEADER]: 3000
    };
    
    return goals[currentRank] || 400;
  }, []);

  return (
    <PersonalAnalystContext.Provider value={{
      personalAnalyst,
      generateAnalysis,
      getMotivationalMessage,
      getRecommendations,
      getAchievements
    }}>
      {children}
    </PersonalAnalystContext.Provider>
  );
}

export const usePersonalAnalyst = () => {
  const context = useContext(PersonalAnalystContext);
  if (context === undefined) {
    throw new Error('usePersonalAnalyst must be used within a PersonalAnalystProvider');
  }
  return context;
};
'use client';

import { useGamification } from '@/contexts/gamification-context';
import { RANK_INFO, LEAGUE_INFO } from '@/lib/types/gamification';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMemo } from 'react';
import { useLocale } from 'next-intl';

interface MiniProfileWidgetProps {
  isCollapsed?: boolean;
}

export function MiniProfileWidget({ isCollapsed = false }: MiniProfileWidgetProps) {
  const router = useRouter();
  const locale = useLocale();
  const { userProfile, getStreakInfo } = useGamification();
  const streakInfo = getStreakInfo();

  const xpProgress = useMemo(() => {
    if (!userProfile) return { percentage: 0, current: 0, next: 0 };
    
    const currentRankIndex = Object.keys(RANK_INFO).indexOf(userProfile.currentRank);
    const nextRankKey = Object.keys(RANK_INFO)[currentRankIndex + 1];
    
    if (!nextRankKey) return { percentage: 100, current: userProfile.xp, next: userProfile.xp };
    
    const currentThreshold = currentRankIndex === 0 ? 0 : 
      [0, 500, 2000, 5000, 10000][currentRankIndex];
    const nextThreshold = [500, 2000, 5000, 10000, 15000][currentRankIndex];
    
    const xpInCurrentRank = userProfile.xp - currentThreshold;
    const xpNeededForRank = nextThreshold - currentThreshold;
    const percentage = (xpInCurrentRank / xpNeededForRank) * 100;
    
    return {
      percentage: Math.min(percentage, 100),
      current: userProfile.xp,
      next: nextThreshold
    };
  }, [userProfile]);

  if (!userProfile) return null;

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
        {userProfile.avatar && (
          <div className="relative">
            <Image
              src={userProfile.avatar}
              alt={userProfile.name}
              width={40}
              height={40}
              className="rounded-full border border-white/20"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#0f6acd] to-[#1a8dff] flex items-center justify-center">
              <span className="text-xs font-bold text-white">{RANK_INFO[userProfile.currentRank].emoji}</span>
            </div>
          </div>
        )}
        <div className="text-center">
          <div className="text-xs font-semibold text-white">{userProfile.xp}</div>
          <div className="text-[10px] text-white/60">XP</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
      {/* User Info */}
      <div className="flex items-center gap-3">
        {userProfile.avatar && (
          <div className="relative">
            <Image
              src={userProfile.avatar}
              alt={userProfile.name}
              width={48}
              height={48}
              className="rounded-full border border-white/20"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-[#0f6acd] to-[#1a8dff] flex items-center justify-center">
              <span className="text-xs">{RANK_INFO[userProfile.currentRank].emoji}</span>
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm truncate">{userProfile.name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`text-xs font-semibold ${RANK_INFO[userProfile.currentRank].color}`}>
              {RANK_INFO[userProfile.currentRank].name}
            </span>
            <span className="text-xs text-white/40">•</span>
            <span className={`text-xs font-semibold ${LEAGUE_INFO[userProfile.league].color}`}>
              {LEAGUE_INFO[userProfile.league].name}
            </span>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-white/60">XP</span>
          <span className="text-white font-medium">{xpProgress.current}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${xpProgress.percentage}%` }}
          />
        </div>
      </div>

      {/* Streak - Prominent Display */}
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-3 mb-3">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{streakInfo.currentStreak}</div>
            <div className="text-xs text-orange-200 font-medium">GÜNLÜK STREAK</div>
          </div>
          {streakInfo.nextMilestone > 0 && (
            <div className="text-right">
              <div className="text-xs text-orange-200">Sonraki: {streakInfo.nextMilestone}</div>
            </div>
          )}
        </div>
      </div>

      {/* Other Stats */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-white font-medium">{userProfile.weeklyXp}</div>
            <div className="text-white/40">Hafta</div>
          </div>
          <div className="text-center">
            <div className="text-white font-medium">{userProfile.followedTopics.length}</div>
            <div className="text-white/40">Takip</div>
          </div>
        </div>
        {userProfile.streakProtection > 0 && (
          <div className="flex items-center gap-1 bg-purple-500/20 px-2 py-1 rounded-full">
            <svg className="w-3 h-3 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 1z"/>
            </svg>
            <span className="text-purple-300 text-xs font-medium">{userProfile.streakProtection}</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 pt-2 border-t border-white/10">
        <button 
          onClick={() => router.push(`/${locale}/profile`)}
          className="flex-1 py-1.5 px-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Profil
        </button>
        <button 
          onClick={() => router.push(`/${locale}/leaderboard`)}
          className="flex-1 py-1.5 px-3 bg-white/10 text-white text-xs font-medium rounded-lg hover:bg-white/20 transition-all"
        >
          Liderlik
        </button>
      </div>
    </div>
  );
}

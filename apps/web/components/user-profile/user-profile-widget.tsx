'use client';

import { useGamification } from '@/contexts/gamification-context';
import { RANK_INFO, LEAGUE_INFO, Badge } from '@/lib/types/gamification';
import Image from 'next/image';
import { useMemo } from 'react';

export function UserProfileWidget() {
  const { userProfile, getStreakInfo } = useGamification();
  const streakInfo = getStreakInfo();

  const xpProgress = useMemo(() => {
    if (!userProfile) return { percentage: 0, current: 0, next: 0 };
    
    const currentRankIndex = Object.keys(RANK_INFO).indexOf(userProfile.currentRank);
    const nextRankKey = Object.keys(RANK_INFO)[currentRankIndex + 1];
    
    if (!nextRankKey) return { percentage: 100, current: userProfile.xp, next: userProfile.xp };
    
    const currentThreshold = currentRankIndex === 0 ? 0 : 
      Object.values(RANK_INFO)[currentRankIndex - 1] ? 
      [500, 2000, 5000, 10000][currentRankIndex - 1] : 0;
    const nextThreshold = [500, 2000, 5000, 10000][currentRankIndex];
    
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

  return (
    <div className="fixed top-20 right-4 z-40 w-80">
      <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl shadow-xl border border-white/10 p-6">
        {/* User Info */}
        <div className="flex items-start gap-4 mb-6">
          {userProfile.avatar && (
            <Image
              src={userProfile.avatar}
              alt={userProfile.name}
              width={64}
              height={64}
              className="rounded-full border-2 border-white/20"
            />
          )}
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">{userProfile.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${RANK_INFO[userProfile.currentRank].bgColor} ${RANK_INFO[userProfile.currentRank].color} border ${RANK_INFO[userProfile.currentRank].borderColor}`}>
                <span>{RANK_INFO[userProfile.currentRank].emoji}</span>
                <span>{RANK_INFO[userProfile.currentRank].name}</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${LEAGUE_INFO[userProfile.league].bgColor} ${LEAGUE_INFO[userProfile.league].color} border ${LEAGUE_INFO[userProfile.league].borderColor}`}>
                <span>{LEAGUE_INFO[userProfile.league].emoji}</span>
                <span>{LEAGUE_INFO[userProfile.league].name}</span>
              </span>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/60">XP İlerlemesi</span>
            <span className="text-white font-medium">{xpProgress.current} / {xpProgress.next} XP</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${xpProgress.percentage}%` }}
            />
          </div>
        </div>

        {/* Streak Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/60">Streak</span>
              <span className="text-2xl">🔥</span>
            </div>
            <div className="text-2xl font-bold text-white">{streakInfo.currentStreak}</div>
            <div className="text-xs text-white/40">gün</div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/60">Sezon XP</span>
              <span className="text-2xl">⭐</span>
            </div>
            <div className="text-2xl font-bold text-white">{userProfile.seasonXp}</div>
            <div className="text-xs text-white/40">puan</div>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className="text-white font-semibold">{userProfile.weeklyXp}</div>
            <div className="text-xs text-white/40">Haftalık</div>
          </div>
          <div className="text-center">
            <div className="text-white font-semibold">{userProfile.monthlyXp}</div>
            <div className="text-xs text-white/40">Aylık</div>
          </div>
          <div className="text-center">
            <div className="text-white font-semibold">{userProfile.followedTopics.length}</div>
            <div className="text-xs text-white/40">Takip</div>
          </div>
        </div>

        {/* Badges */}
        {userProfile.badges.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <h4 className="text-sm font-medium text-white/60 mb-2">Rozetler</h4>
            <div className="flex gap-2">
              {userProfile.badges.includes('STREAK_3' as Badge) && (
                <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center" title="3 Gün Streak">
                  <span className="text-lg">🔥</span>
                </div>
              )}
              {userProfile.badges.includes('STREAK_7' as Badge) && (
                <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center" title="7 Gün Streak">
                  <span className="text-lg">🏏</span>
                </div>
              )}
              {userProfile.badges.includes('STREAK_30' as Badge) && (
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center" title="30 Gün Streak">
                  <span className="text-lg">🏅</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Streak Protection */}
        {userProfile.streakProtection > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">Streak Koruması</span>
              <span className="text-sm font-semibold text-purple-300">{userProfile.streakProtection} adet</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
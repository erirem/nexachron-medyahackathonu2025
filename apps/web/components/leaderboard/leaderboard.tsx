'use client';

import { useState } from 'react';
import Image from 'next/image';
import { LeaderboardEntry, RANK_INFO, LEAGUE_INFO, UserRank, League } from '@/lib/types/gamification';

// Mock leaderboard data
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    userId: 'user-123',
    name: 'Ahmet Yılmaz',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    rank: 'ACTIVE_READER' as UserRank,

    league: 'SILVER' as League,
    xp: 1250,
    position: 5,
    movement: 'up',
    movementAmount: 2
  },
  {
    userId: 'user-1',
    name: 'Mehmet Demir',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rank: 'EXPERT_COMMENTER' as UserRank,
    league: 'GOLD' as League,
    xp: 5200,
    position: 1,
    movement: 'same',
    movementAmount: 0
  },
  {
    userId: 'user-2',
    name: 'Ayşe Kaya',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rank: 'COMMUNITY_LEADER' as UserRank,
    league: 'DIAMOND' as League,
    xp: 12500,
    position: 2,
    movement: 'up',
    movementAmount: 1
  },
  {
    userId: 'user-3',
    name: 'Ali Vural',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    rank: 'KNOWLEDGE_SHARER' as UserRank,
    league: 'GOLD' as League,
    xp: 3800,
    position: 3,
    movement: 'down',
    movementAmount: 2
  },
  {
    userId: 'user-4',
    name: 'Zeynep Öz',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rank: 'ACTIVE_READER' as UserRank,
    league: 'SILVER' as League,
    xp: 1850,
    position: 4,
    movement: 'up',
    movementAmount: 3
  }
];

type Period = 'weekly' | 'monthly' | 'all-time';

export function Leaderboard() {
  const [period, setPeriod] = useState<Period>('weekly');
  const [showOnlyLeague, setShowOnlyLeague] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl shadow-xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🏆</span>
              <span>Liderlik Tablosu</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOnlyLeague(!showOnlyLeague)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${showOnlyLeague
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
              >
                Sadece Ligim
              </button>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2">
            {(['weekly', 'monthly', 'all-time'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
              >
                {p === 'weekly' ? 'Haftalık' : p === 'monthly' ? 'Aylık' : 'Tüm Zamanlar'}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="p-6 space-y-3">
          {MOCK_LEADERBOARD.map((entry, index) => {
            const rankInfo = RANK_INFO[entry.rank];
            const leagueInfo = LEAGUE_INFO[entry.league];
            const isCurrentUser = entry.userId === 'user-123';

            return (
              <div
                key={entry.userId}
                className={`relative rounded-xl p-4 transition-all ${isCurrentUser
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
              >
                <div className="flex items-center gap-4">
                  {/* Position */}
                  <div className="text-center min-w-[50px]">
                    <div className={`text-2xl font-bold ${entry.position === 1 ? 'text-yellow-400' :
                        entry.position === 2 ? 'text-gray-300' :
                          entry.position === 3 ? 'text-orange-400' :
                            'text-white'
                      }`}>
                      {entry.position === 1 ? '🥇' :
                        entry.position === 2 ? '🥈' :
                          entry.position === 3 ? '🥉' :
                            `#${entry.position}`}
                    </div>
                    {/* Movement Indicator */}
                    {entry.movement !== 'same' && (
                      <div className={`text-xs font-medium ${entry.movement === 'up' ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {entry.movement === 'up' ? '↑' : '↓'} {entry.movementAmount}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <Image
                      src={entry.avatar || ''}
                      alt={entry.name}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-white/20"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">{entry.name}</h3>
                        {isCurrentUser && (
                          <span className="text-xs text-blue-300 font-medium">(Sen)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${rankInfo.bgColor} ${rankInfo.color} border ${rankInfo.borderColor}`}>
                          <span>{rankInfo.emoji}</span>
                          <span>{rankInfo.name}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${leagueInfo.bgColor} ${leagueInfo.color} border ${leagueInfo.borderColor}`}>
                          <span>{leagueInfo.emoji}</span>
                          <span>{leagueInfo.name}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{entry.xp.toLocaleString()}</div>
                    <div className="text-xs text-white/40">XP</div>
                  </div>
                </div>

                {/* Special badges for top 3 */}
                {entry.position <= 3 && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg">
                      <span className="text-xs font-bold text-white">TOP</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Season Info */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white/60">Mevcut Sezon</h3>
              <p className="text-white font-semibold">Ekim 2024</p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-medium text-white/60">Bitiş</h3>
              <p className="text-white font-semibold">4 gün kaldı</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-white/40">
              Sezon sonunda ilk 3&apos;e girenler özel rozetler kazanacak! 🏅
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
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
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl">🏆</span>
              <span>Liderlik Tablosu</span>
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowOnlyLeague(!showOnlyLeague)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  showOnlyLeague
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-lg'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
              >
                Sadece Ligim
              </button>
            </div>
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-3">
            {(['weekly', 'monthly', 'all-time'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  period === p
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {p === 'weekly' ? 'Haftalık' : p === 'monthly' ? 'Aylık' : 'Tüm Zamanlar'}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="p-8 space-y-4">
          {MOCK_LEADERBOARD
            .sort((a, b) => b.xp - a.xp) // XP'ye göre azalan sıralama
            .map((entry, index) => {
            const rankInfo = RANK_INFO[entry.rank];
            const leagueInfo = LEAGUE_INFO[entry.league];
            const isCurrentUser = entry.userId === 'user-123';
            const actualPosition = index + 1; // Gerçek sıralama pozisyonu

            return (
              <div
                key={entry.userId}
                className={`relative rounded-xl p-6 transition-all duration-200 ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 shadow-lg'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-6">
                  {/* Position */}
                  <div className="text-center min-w-[70px]">
                    <div className={`text-3xl font-bold ${
                      actualPosition === 1 ? 'text-yellow-400' :
                      actualPosition === 2 ? 'text-gray-300' :
                      actualPosition === 3 ? 'text-orange-400' :
                      'text-white'
                    }`}>
                      {actualPosition === 1 ? '🥇' :
                       actualPosition === 2 ? '🥈' :
                       actualPosition === 3 ? '🥉' :
                       `#${actualPosition}`}
                    </div>
                    {/* Movement Indicator */}
                    {entry.movement !== 'same' && (
                      <div className={`text-sm font-medium ${
                        entry.movement === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {entry.movement === 'up' ? '↑' : '↓'} {entry.movementAmount}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <Image
                      src={entry.avatar || ''}
                      alt={entry.name}
                      width={56}
                      height={56}
                      className="rounded-full border-2 border-white/20 shadow-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">{entry.name}</h3>
                        {isCurrentUser && (
                          <span className="text-sm text-blue-300 font-medium bg-blue-500/20 px-2 py-1 rounded-full">(Sen)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 ${rankInfo.bgColor} ${rankInfo.color} border ${rankInfo.borderColor} shadow-sm`}>
                          <span>{rankInfo.emoji}</span>
                          <span>{rankInfo.name}</span>
                        </span>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 ${leagueInfo.bgColor} ${leagueInfo.color} border ${leagueInfo.borderColor} shadow-sm`}>
                          <span>{leagueInfo.emoji}</span>
                          <span>{leagueInfo.name}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{entry.xp.toLocaleString()}</div>
                    <div className="text-sm text-white/40 font-medium">XP</div>
                  </div>
                </div>

                {/* Special badges for top 3 */}
                {actualPosition <= 3 && (
                  <div className="absolute -top-3 -right-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center shadow-xl">
                      <span className="text-sm font-bold text-white">TOP</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Season Info */}
        <div className="p-8 border-t border-white/10 bg-gradient-to-r from-white/5 to-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-medium text-white/60 mb-1">Mevcut Sezon</h3>
              <p className="text-white font-bold text-lg">Ekim 2024</p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-medium text-white/60 mb-1">Bitiş</h3>
              <p className="text-white font-bold text-lg">4 gün kaldı</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/60 flex items-center justify-center gap-2">
              <span>🏅</span>
              <span>Sezon sonunda ilk 3&apos;e girenler özel rozetler kazanacak!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
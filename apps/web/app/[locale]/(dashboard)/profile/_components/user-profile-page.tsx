'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGamification } from '@/contexts/gamification-context';
import { RANK_INFO, LEAGUE_INFO, Badge, XP_VALUES } from '@/lib/types/gamification';

export function UserProfilePage() {
  const { userProfile, getStreakInfo } = useGamification();
  const streakInfo = getStreakInfo();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity' | 'settings'>('overview');

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#08111c] via-[#0d1421] to-[#0a0f1a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const nextRankThresholds = [500, 2000, 5000, 10000, 15000];
  const currentRankIndex = Object.keys(RANK_INFO).indexOf(userProfile.currentRank);
  const nextThreshold = nextRankThresholds[currentRankIndex];
  const xpToNextRank = nextThreshold ? nextThreshold - userProfile.xp : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#08111c] via-[#0d1421] to-[#0a0f1a]">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5m7-7l-7 7 7 7"/>
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-white">Profilim</h1>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl border border-white/10 p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Image
                  src={userProfile.avatar || ''}
                  alt={userProfile.name}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white/20"
                />
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-[#0f6acd] to-[#1a8dff] flex items-center justify-center border-4 border-[#0f1623]">
                  <span className="text-2xl">{RANK_INFO[userProfile.currentRank].emoji}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h2 className="text-2xl font-bold text-white">{userProfile.name}</h2>
                  <p className="text-white/60">{userProfile.email}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${RANK_INFO[userProfile.currentRank].bgColor} ${RANK_INFO[userProfile.currentRank].color} border ${RANK_INFO[userProfile.currentRank].borderColor}`}>
                    <span>{RANK_INFO[userProfile.currentRank].emoji}</span>
                    <span>{RANK_INFO[userProfile.currentRank].name}</span>
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${LEAGUE_INFO[userProfile.league].bgColor} ${LEAGUE_INFO[userProfile.league].color} border ${LEAGUE_INFO[userProfile.league].borderColor}`}>
                    <span>{LEAGUE_INFO[userProfile.league].emoji}</span>
                    <span>{LEAGUE_INFO[userProfile.league].name}</span>
                  </span>
                </div>
                
                <div className="text-sm text-white/60">
                  Katılım tarihi: {new Date(userProfile.joinDate).toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
            
            {/* XP Progress */}
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{userProfile.xp.toLocaleString()}</div>
              <div className="text-white/60 mb-2">Toplam XP</div>
              {nextThreshold && (
                <div className="text-sm text-white/60">
                  Sonraki rütbeye {xpToNextRank} XP kaldı
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'overview', label: '📊 Genel Bakış' },
            { id: 'achievements', label: '🏆 Başarılar' },
            { id: 'activity', label: '📈 Aktivite' },
            { id: 'settings', label: '⚙️ Ayarlar' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'achievements' | 'activity' | 'settings')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* XP Stats */}
              <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">📈 XP İstatistikleri</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{userProfile.weeklyXp}</div>
                    <div className="text-sm text-white/60">Bu Hafta</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{userProfile.monthlyXp}</div>
                    <div className="text-sm text-white/60">Bu Ay</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{userProfile.seasonXp}</div>
                    <div className="text-sm text-white/60">Bu Sezon</div>
                  </div>
                </div>
              </div>

              {/* Followed Topics */}
              <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">👁️ Takip Ettiğim Konular</h3>
                <div className="flex flex-wrap gap-3">
                  {userProfile.followedTopics.map((topic, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
                    >
                      {topic}
                    </span>
                  ))}
                  {userProfile.followedTopics.length === 0 && (
                    <p className="text-white/60">Henüz hiçbir konu takip etmiyorsun.</p>
                  )}
                </div>
              </div>

              {/* XP Earning Methods */}
              <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">💰 XP Kazanma Yolları</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📖</span>
                      <div>
                        <div className="text-white font-medium">Haber Okuma</div>
                        <div className="text-sm text-white/60">Her haber için</div>
                      </div>
                    </div>
                    <span className="text-green-400 font-bold">+{XP_VALUES.NEWS_READ} XP</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💬</span>
                      <div>
                        <div className="text-white font-medium">Yorum Yapma</div>
                        <div className="text-sm text-white/60">Her yorum için</div>
                      </div>
                    </div>
                    <span className="text-green-400 font-bold">+{XP_VALUES.COMMENT} XP</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">👁️</span>
                      <div>
                        <div className="text-white font-medium">Konu Takibi</div>
                        <div className="text-sm text-white/60">Her takip için</div>
                      </div>
                    </div>
                    <span className="text-green-400 font-bold">+{XP_VALUES.TOPIC_FOLLOW} XP</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔥</span>
                      <div>
                        <div className="text-white font-medium">7 Gün Streak</div>
                        <div className="text-sm text-white/60">Bonus XP</div>
                      </div>
                    </div>
                    <span className="text-green-400 font-bold">+{XP_VALUES.STREAK_7_DAYS} XP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Streak Info */}
              <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">🔥 Streak Bilgilerim</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{streakInfo.currentStreak}</div>
                    <div className="text-white/60">Mevcut Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{streakInfo.longestStreak}</div>
                    <div className="text-white/60">En Uzun Streak</div>
                  </div>
                  {streakInfo.nextMilestone > 0 && (
                    <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-500/30">
                      <div className="text-center text-orange-300">
                        <div className="font-bold">{streakInfo.nextMilestone} gün streak</div>
                        <div className="text-sm">ile özel ödül kazan!</div>
                      </div>
                    </div>
                  )}
                  {userProfile.streakProtection > 0 && (
                    <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/30">
                      <div className="text-center text-purple-300">
                        <div className="font-bold">{userProfile.streakProtection} Koruma</div>
                        <div className="text-sm">Streak koruması mevcut</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">🏆 Son Başarılar</h3>
                <div className="space-y-3">
                  {userProfile.badges.map((badge, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <span className="text-2xl">
                        {badge === Badge.STREAK_3 ? '🔥' :
                         badge === Badge.STREAK_7 ? '🃏' :
                         badge === Badge.STREAK_30 ? '🏅' : '⭐'}
                      </span>
                      <div>
                        <div className="text-white font-medium">
                          {badge === Badge.STREAK_3 ? '3 Gün Streak' :
                           badge === Badge.STREAK_7 ? '7 Gün Streak' :
                           badge === Badge.STREAK_30 ? '30 Gün Streak' : 'Özel Rozet'}
                        </div>
                        <div className="text-sm text-white/60">Tebrikler!</div>
                      </div>
                    </div>
                  ))}
                  {userProfile.badges.length === 0 && (
                    <p className="text-white/60 text-center py-4">
                      Henüz rozet kazanmadın.<br />
                      Aktivitelerini sürdür!
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">🚀 Hızlı Erişim</h3>
                <div className="space-y-3">
                  <Link 
                    href="/leaderboard"
                    className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white"
                  >
                    🏆 Liderlik Tablosu
                  </Link>
                  <Link 
                    href="/dashboard"
                    className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white"
                  >
                    📰 Haberler
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl border border-white/10 p-8">
            <h3 className="text-2xl font-bold text-white mb-6">🏆 Başarılarım</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { badge: Badge.STREAK_3, title: '3 Gün Streak', desc: '3 gün üst üste giriş yap', icon: '🔥', earned: userProfile.badges.includes(Badge.STREAK_3) },
                { badge: Badge.STREAK_7, title: '7 Gün Streak', desc: '1 hafta boyunca giriş yap', icon: '🃏', earned: userProfile.badges.includes(Badge.STREAK_7) },
                { badge: Badge.STREAK_30, title: '30 Gün Streak', desc: '1 ay boyunca giriş yap', icon: '🏅', earned: userProfile.badges.includes(Badge.STREAK_30) },
                { badge: 'TOP_COMMENTER' as Badge, title: 'Haftanın Yorumcusu', desc: 'En çok yorum yapan kullanıcı ol', icon: '💬', earned: false },
                { badge: 'QUIZ_MASTER' as Badge, title: 'Quiz Ustası', desc: '10 quiz\'i doğru çöz', icon: '🧠', earned: false },
                { badge: 'TRENDING_FOLLOWER' as Badge, title: 'Trend Takipçisi', desc: '5 trend konuyu takip et', icon: '📈', earned: false }
              ].map((achievement) => (
                <div 
                  key={achievement.badge}
                  className={`p-6 rounded-2xl border transition-all ${
                    achievement.earned
                      ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                      : 'bg-white/5 border-white/10 opacity-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h4 className="text-white font-bold mb-2">{achievement.title}</h4>
                    <p className="text-white/60 text-sm">{achievement.desc}</p>
                    {achievement.earned && (
                      <div className="mt-3 text-yellow-400 font-medium text-sm">✓ Tamamlandı</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl border border-white/10 p-8">
            <h3 className="text-2xl font-bold text-white mb-6">📈 Son Aktiviteler</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Haber okudun</div>
                    <div className="text-sm text-white/60">Borsa İstanbul rekor hacimle...</div>
                  </div>
                  <div className="text-green-400 font-bold">+10 XP</div>
                </div>
                <div className="text-xs text-white/40 mt-2">2 dakika önce</div>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Yorum yaptın</div>
                    <div className="text-sm text-white/60">Harika bir analiz!</div>
                  </div>
                  <div className="text-green-400 font-bold">+20 XP</div>
                </div>
                <div className="text-xs text-white/40 mt-2">5 dakika önce</div>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Konu takip ettin</div>
                    <div className="text-sm text-white/60">Teknoloji</div>
                  </div>
                  <div className="text-green-400 font-bold">+15 XP</div>
                </div>
                <div className="text-xs text-white/40 mt-2">1 saat önce</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl border border-white/10 p-8">
            <h3 className="text-2xl font-bold text-white mb-6">⚙️ Ayarlar</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Bildirim Tercihleri</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-white">Streak hatırlatıcıları</span>
                    <input type="checkbox" className="form-checkbox" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-white">Yeni haber bildirimleri</span>
                    <input type="checkbox" className="form-checkbox" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-white">XP kazandığımda bildirim al</span>
                    <input type="checkbox" className="form-checkbox" defaultChecked />
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Gizlilik</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-white">Profilimi liderlik tablosunda göster</span>
                    <input type="checkbox" className="form-checkbox" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-white">Yorumlarımda adımı göster</span>
                    <input type="checkbox" className="form-checkbox" defaultChecked />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
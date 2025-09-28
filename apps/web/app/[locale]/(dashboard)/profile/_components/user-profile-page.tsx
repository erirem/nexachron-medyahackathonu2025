'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGamification } from '@/contexts/gamification-context';
import { RANK_INFO, LEAGUE_INFO, Badge, XP_VALUES, BADGE_INFO, BadgeType, BadgeCategory } from '@/lib/types/gamification';

export function UserProfilePage() {
  const { userProfile, getStreakInfo } = useGamification();
  const streakInfo = getStreakInfo();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'badges' | 'activity' | 'settings'>('overview');

  // Icon render fonksiyonu
  const renderIcon = (iconName: string, className: string = "w-6 h-6") => {
    const iconProps = { className, strokeWidth: 2 };
    
    switch (iconName) {
      case 'flame':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
      case 'calendar-check':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>;
      case 'trophy':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21l-1.5.5c-.5.17-1.03.17-1.53 0l-1.5-.5A1.25 1.25 0 0 1 4 17v-2.34"/><path d="M20 14.66V17c0 .55-.47.98-.97 1.21l-1.5.5c-.5.17-1.03.17-1.53 0l-1.5-.5A1.25 1.25 0 0 1 14 17v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
      case 'brain':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-4.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-4.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
      case 'message-circle':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
      case 'trending-up':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>;
      case 'crown':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519L20.5 13H3.5l1.5-7a.5.5 0 0 1 .798-.519l4.277 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>;
      case 'star':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/></svg>;
      case 'target':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
      case 'map':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2 1,6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
      case 'award':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>;
      case 'zap':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>;
      case 'bar-chart':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
      case 'trophy-icon':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21l-1.5.5c-.5.17-1.03.17-1.53 0l-1.5-.5A1.25 1.25 0 0 1 4 17v-2.34"/><path d="M20 14.66V17c0 .55-.47.98-.97 1.21l-1.5.5c-.5.17-1.03.17-1.53 0l-1.5-.5A1.25 1.25 0 0 1 14 17v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
      case 'activity':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
      case 'settings':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
      case 'badge':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
      case 'eye':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
      case 'book-open':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
      case 'message-square':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
      case 'users':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
      case 'zap-2':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
      case 'check-circle':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>;
      case 'file-text':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>;
      case 'arrow-left':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>;
      case 'lightbulb':
        return <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z"/><path d="M12 2C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>;
      default:
        return <div className={className}>?</div>;
    }
  };

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
              {renderIcon('arrow-left', "w-5 h-5")}
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
                
                <div className="space-y-3">
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
                  
                  {/* Nadir Rozetler */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60 font-medium">Nadir Rozetler:</span>
                    <div className="flex items-center gap-1">
                      {userProfile.badgeInfo
                        .filter(badge => badge.type === BadgeType.RARE && badge.isEarned)
                        .slice(0, 5) // Maksimum 5 rozet göster
                        .map((badge, index) => (
                          <div 
                            key={badge.id}
                            className="relative group"
                            title={`${badge.name} - ${badge.description}`}
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                              {renderIcon(badge.icon, "w-5 h-5")}
                            </div>
                            {/* Nadir rozet işareti */}
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                              {renderIcon('star', "w-2 h-2")}
                            </div>
                          </div>
                        ))}
                      {userProfile.badgeInfo.filter(badge => badge.type === BadgeType.RARE && badge.isEarned).length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs text-white/60 font-bold">
                          +{userProfile.badgeInfo.filter(badge => badge.type === BadgeType.RARE && badge.isEarned).length - 5}
                        </div>
                      )}
                      {userProfile.badgeInfo.filter(badge => badge.type === BadgeType.RARE && badge.isEarned).length === 0 && (
                        <span className="text-xs text-white/40">Henüz nadir rozet kazanmadın</span>
                      )}
                    </div>
                  </div>
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
            { id: 'overview', label: 'Genel Bakış', icon: 'bar-chart' },
            { id: 'achievements', label: 'Başarılar', icon: 'trophy-icon' },
            { id: 'badges', label: 'Rozetler', icon: 'badge' },
            { id: 'activity', label: 'Aktivite', icon: 'activity' },
            { id: 'settings', label: 'Ayarlar', icon: 'settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'achievements' | 'badges' | 'activity' | 'settings')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
              }`}
            >
              {renderIcon(tab.icon, "w-5 h-5")}
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
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  {renderIcon('trending-up', "w-6 h-6")}
                  XP İstatistikleri
                </h3>
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
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  {renderIcon('eye', "w-6 h-6")}
                  Takip Ettiğim Konular
                </h3>
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
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  {renderIcon('zap', "w-6 h-6")}
                  XP Kazanma Yolları
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      {renderIcon('book-open', "w-6 h-6")}
                      <div>
                        <div className="text-white font-medium">Haber Okuma</div>
                        <div className="text-sm text-white/60">Her haber için</div>
                      </div>
                    </div>
                    <span className="text-green-400 font-bold">+{XP_VALUES.NEWS_READ} XP</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      {renderIcon('message-square', "w-6 h-6")}
                      <div>
                        <div className="text-white font-medium">Yorum Yapma</div>
                        <div className="text-sm text-white/60">Her yorum için</div>
                      </div>
                    </div>
                    <span className="text-green-400 font-bold">+{XP_VALUES.COMMENT} XP</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      {renderIcon('eye', "w-6 h-6")}
                      <div>
                        <div className="text-white font-medium">Konu Takibi</div>
                        <div className="text-sm text-white/60">Her takip için</div>
                      </div>
                    </div>
                    <span className="text-green-400 font-bold">+{XP_VALUES.TOPIC_FOLLOW} XP</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      {renderIcon('flame', "w-6 h-6")}
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
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  {renderIcon('flame', "w-6 h-6")}
                  Streak Bilgilerim
                </h3>
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
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  {renderIcon('trophy', "w-6 h-6")}
                  Son Başarılar
                </h3>
                <div className="space-y-3">
                  {userProfile.badges.map((badge, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <div className="w-8 h-8 flex items-center justify-center">
                        {badge === Badge.STREAK_3 ? renderIcon('flame', "w-6 h-6") :
                         badge === Badge.STREAK_7 ? renderIcon('calendar-check', "w-6 h-6") :
                         badge === Badge.STREAK_30 ? renderIcon('trophy', "w-6 h-6") : renderIcon('star', "w-6 h-6")}
                      </div>
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
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  {renderIcon('zap-2', "w-6 h-6")}
                  Hızlı Erişim
                </h3>
                <div className="space-y-3">
                  <Link 
                    href="/leaderboard"
                    className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white flex items-center gap-3"
                  >
                    {renderIcon('trophy', "w-5 h-5")}
                    Liderlik Tablosu
                  </Link>
                  <Link 
                    href="/dashboard"
                    className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white flex items-center gap-3"
                  >
                    {renderIcon('book-open', "w-5 h-5")}
                    Haberler
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl border border-white/10 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              {renderIcon('trophy', "w-8 h-8")}
              Başarılarım
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { badge: Badge.STREAK_3, title: '3 Gün Streak', desc: '3 gün üst üste giriş yap', icon: 'flame', earned: userProfile.badges.includes(Badge.STREAK_3) },
                { badge: Badge.STREAK_7, title: '7 Gün Streak', desc: '1 hafta boyunca giriş yap', icon: 'calendar-check', earned: userProfile.badges.includes(Badge.STREAK_7) },
                { badge: Badge.STREAK_30, title: '30 Gün Streak', desc: '1 ay boyunca giriş yap', icon: 'trophy', earned: userProfile.badges.includes(Badge.STREAK_30) },
                { badge: 'TOP_COMMENTER' as Badge, title: 'Haftanın Yorumcusu', desc: 'En çok yorum yapan kullanıcı ol', icon: 'message-circle', earned: false },
                { badge: 'QUIZ_MASTER' as Badge, title: 'Quiz Ustası', desc: '10 quiz\'i doğru çöz', icon: 'brain', earned: false },
                { badge: 'TRENDING_FOLLOWER' as Badge, title: 'Trend Takipçisi', desc: '5 trend konuyu takip et', icon: 'trending-up', earned: false }
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
                    <div className="flex justify-center mb-3">
                      {renderIcon(achievement.icon, "w-12 h-12")}
                    </div>
                    <h4 className="text-white font-bold mb-2">{achievement.title}</h4>
                    <p className="text-white/60 text-sm">{achievement.desc}</p>
                    {achievement.earned && (
                      <div className="mt-3 text-yellow-400 font-medium text-sm flex items-center justify-center gap-1">
                        {renderIcon('check-circle', "w-4 h-4")}
                        Tamamlandı
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-8">
            {/* Rozet İstatistikleri */}
            <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl border border-white/10 p-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                {renderIcon('badge', "w-7 h-7")}
                Rozet Koleksiyonum
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {userProfile.badgeInfo.filter(badge => badge.isEarned).length}
                  </div>
                  <div className="text-white/60">Kazanılan</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {userProfile.badgeInfo.filter(badge => badge.type === BadgeType.GENERAL && badge.isEarned).length}
                  </div>
                  <div className="text-white/60">Genel</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {userProfile.badgeInfo.filter(badge => badge.type === BadgeType.RARE && badge.isEarned).length}
                  </div>
                  <div className="text-white/60">Nadir</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {userProfile.badgeInfo.filter(badge => badge.rarity === 'legendary' && badge.isEarned).length}
                  </div>
                  <div className="text-white/60">Efsanevi</div>
                </div>
              </div>
            </div>

            {/* Rozet Filtreleri */}
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium">
                Tümü
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 font-medium">
                Genel Rozetler
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 font-medium">
                Nadir Rozetler
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 font-medium">
                Streak
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 font-medium">
                Quiz
              </button>
            </div>

            {/* Genel Rozetler */}
            <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                {renderIcon('star', "w-6 h-6")}
                Genel Rozetler
                <span className="text-sm text-white/60 font-normal">
                  ({userProfile.badgeInfo.filter(badge => badge.type === BadgeType.GENERAL).length} rozet)
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProfile.badgeInfo.filter(badge => badge.type === BadgeType.GENERAL).map((badge) => (
                  <div 
                    key={badge.id}
                    className={`p-4 rounded-xl border transition-all ${
                      badge.isEarned
                        ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30'
                        : 'bg-white/5 border-white/10 opacity-60'
                    }`}
                  >
                    <div className="text-center">
                      <div className="flex justify-center mb-3">
                        {renderIcon(badge.icon, "w-12 h-12")}
                      </div>
                      <h4 className="text-white font-bold mb-2">{badge.name}</h4>
                      <p className="text-white/60 text-sm mb-3">{badge.description}</p>
                      <div className="text-xs text-white/40 mb-2">
                        Gereksinim: {badge.requirement}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-400 font-bold">+{badge.xpReward} XP</span>
                        <span className="text-white/40">{badge.totalEarned} kişi</span>
                      </div>
                      {badge.isEarned && (
                        <div className="mt-2 text-green-400 font-medium text-sm flex items-center justify-center gap-1">
                          <span>✓</span>
                          <span>Kazanıldı</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nadir Rozetler */}
            <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                {renderIcon('award', "w-6 h-6")}
                Nadir Rozetler
                <span className="text-sm text-white/60 font-normal">
                  ({userProfile.badgeInfo.filter(badge => badge.type === BadgeType.RARE).length} rozet)
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProfile.badgeInfo.filter(badge => badge.type === BadgeType.RARE).map((badge) => (
                  <div 
                    key={badge.id}
                    className={`p-4 rounded-xl border transition-all relative ${
                      badge.isEarned
                        ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30'
                        : 'bg-white/5 border-white/10 opacity-60'
                    }`}
                  >
                    {/* Nadir rozet işareti */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-black">
                      {renderIcon('star', "w-4 h-4")}
                    </div>
                    
                    <div className="text-center">
                      <div className="flex justify-center mb-3">
                        {renderIcon(badge.icon, "w-12 h-12")}
                      </div>
                      <h4 className="text-white font-bold mb-2">{badge.name}</h4>
                      <p className="text-white/60 text-sm mb-3">{badge.description}</p>
                      <div className="text-xs text-white/40 mb-2">
                        Gereksinim: {badge.requirement}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-400 font-bold">+{badge.xpReward} XP</span>
                        <span className="text-white/40">{badge.totalEarned} kişi</span>
                      </div>
                      {badge.isEarned && (
                        <div className="mt-2 text-purple-400 font-medium text-sm flex items-center justify-center gap-1">
                          <span>✓</span>
                          <span>Kazanıldı</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rozet Kazanma İpuçları */}
            <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                {renderIcon('lightbulb', "w-6 h-6")}
                Rozet Kazanma İpuçları
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    {renderIcon('flame', "w-5 h-5")}
                    Streak Rozetleri
                  </h4>
                  <p className="text-white/60 text-sm">
                    Her gün giriş yaparak streak rozetlerini kazanabilirsin. 3, 7, 30 ve 100 günlük hedefler var!
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    {renderIcon('brain', "w-5 h-5")}
                    Quiz Rozetleri
                  </h4>
                  <p className="text-white/60 text-sm">
                    Quizleri doğru çözerek quiz rozetlerini kazan. Mükemmel skorlar için özel ödüller var!
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    {renderIcon('trending-up', "w-5 h-5")}
                    Aktivite Rozetleri
                  </h4>
                  <p className="text-white/60 text-sm">
                    Haber oku, yorum yap, konu takip et. Aktif olmak rozet kazanmanın en kolay yolu!
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    {renderIcon('award', "w-5 h-5")}
                    Nadir Rozetler
                  </h4>
                  <p className="text-white/60 text-sm">
                    Özel başarılar için nadir rozetler. Bunlar sadece sayılı kişiye verilir!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-2xl border border-white/10 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              {renderIcon('activity', "w-8 h-8")}
              Son Aktiviteler
            </h3>
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
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              {renderIcon('settings', "w-8 h-8")}
              Ayarlar
            </h3>
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
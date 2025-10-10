'use client';

import { useState, useEffect, type JSX } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useGamification } from '@/contexts/gamification-context';
import { usePersonalAnalyst } from '@/contexts/personal-analyst-context';
import { RANK_INFO, LEAGUE_INFO, DailyActivity, WeeklyActivity, MonthlyActivity } from '@/lib/types/gamification';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

type Period = 'daily' | 'weekly' | 'monthly';

export default function PersonalAnalystPage(): JSX.Element {
  const t = useTranslations('personalAnalyst');
  const locale = useLocale();
  const router = useRouter();
  const { userProfile } = useGamification();
  const { personalAnalyst, generateAnalysis, getMotivationalMessage, getRecommendations, getAchievements } = usePersonalAnalyst();
  const [activePeriod, setActivePeriod] = useState<Period>('weekly');

  useEffect(() => {
    if (userProfile && !personalAnalyst) {
      const analysis = generateAnalysis(userProfile);
      // Set the analysis in context if needed
    }
  }, [userProfile, personalAnalyst, generateAnalysis]);

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] flex items-center justify-center p-4 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  const currentRankInfo = RANK_INFO[userProfile.currentRank];
  const currentLeagueInfo = LEAGUE_INFO[userProfile.league];

  const getCurrentStats = (): DailyActivity | WeeklyActivity | MonthlyActivity => {
    switch (activePeriod) {
      case 'daily':
        return userProfile.dailyActivity;
      case 'weekly':
        return userProfile.weeklyActivity;
      case 'monthly':
        return userProfile.monthlyActivity;
      default:
        return userProfile.weeklyActivity;
    }
  };

  const currentStats = getCurrentStats();
  const motivationalMessage = getMotivationalMessage(currentStats, userProfile.currentRank, activePeriod);
  const recommendations = getRecommendations(currentStats, userProfile.currentRank, activePeriod);
  const achievements = getAchievements(currentStats, userProfile, activePeriod);

  const getNextRankProgress = () => {
    const ranks = Object.values(userProfile.currentRank);
    const currentIndex = ranks.indexOf(userProfile.currentRank);
    
    if (currentIndex === -1 || currentIndex === ranks.length - 1) {
      return null;
    }

    const nextRank = ranks[currentIndex + 1];
    const currentRankThreshold = 0; // RANK_THRESHOLDS[userProfile.currentRank];
    const nextRankThreshold = 0; // RANK_THRESHOLDS[nextRank];
    const xpNeededForNextRank = nextRankThreshold - currentRankThreshold;
    const xpEarnedInCurrentRank = userProfile.xp - currentRankThreshold;
    const progressPercentage = xpNeededForNextRank > 0 ? Math.min(100, Math.round((xpEarnedInCurrentRank / xpNeededForNextRank) * 100)) : 100;
    const xpToNext = nextRankThreshold - userProfile.xp;

    return {
      nextRank: RANK_INFO[nextRank as keyof typeof RANK_INFO]?.name || 'Bilinmiyor',
      xpToNext: Math.max(0, xpToNext),
      progressPercentage,
    };
  };

  const nextRankProgress = getNextRankProgress();

  // Chart data preparation
  const getActivityChartData = () => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const data = [];
    
    // Simulate daily data for the current week
    for (let i = 0; i < 7; i++) {
      const baseNews = Math.floor(currentStats.newsRead / 7);
      const baseComments = Math.floor(currentStats.commentsMade / 7);
      const baseXP = Math.floor(currentStats.xpEarned / 7);
      
      data.push({
        day: days[i],
        haber: baseNews + Math.floor(Math.random() * 3),
        yorum: baseComments + Math.floor(Math.random() * 2),
        xp: baseXP + Math.floor(Math.random() * 20),
        quiz: Math.floor(Math.random() * 2)
      });
    }
    return data;
  };

  const getXPProgressData = () => {
    const ranks = Object.values(RANK_INFO);
    const currentRankIndex = ranks.findIndex(rank => rank.name === RANK_INFO[userProfile.currentRank].name);
    
    return ranks.slice(0, currentRankIndex + 2).map((rank, index) => ({
      rank: rank.name,
      xp: RANK_INFO[userProfile.currentRank].threshold + (index * 100),
      current: index === currentRankIndex ? userProfile.xp : 0,
      threshold: rank.threshold
    }));
  };

  const getCategoryBreakdownData = () => {
    return [
      { name: 'Haber Okuma', value: currentStats.newsRead, color: '#3B82F6' },
      { name: 'Yorum Yapma', value: currentStats.commentsMade, color: '#10B981' },
      { name: 'Quiz Çözme', value: currentStats.quizzesCompleted, color: '#F59E0B' },
      { name: 'Konu Takibi', value: currentStats.topicsFollowed, color: '#EF4444' }
    ].filter(item => item.value > 0);
  };

  const getWeeklyTrendData = () => {
    const weeks = ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta'];
    return weeks.map((week, index) => ({
      week,
      xp: Math.max(0, currentStats.xpEarned - (3 - index) * 50),
      haber: Math.max(0, currentStats.newsRead - (3 - index) * 2),
      yorum: Math.max(0, currentStats.commentsMade - (3 - index) * 1)
    }));
  };

  const activityData = getActivityChartData();
  const xpProgressData = getXPProgressData();
  const categoryData = getCategoryBreakdownData();
  const weeklyTrendData = getWeeklyTrendData();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] p-4 text-white">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
            <p className="text-white/70">Kişiselleştirilmiş analiz ve öneriler</p>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
          >
            ← Geri
          </button>
        </div>

        {/* Period Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-xl p-1 mb-8">
          {[
            { key: 'daily', label: 'Günlük', icon: '📅' },
            { key: 'weekly', label: 'Haftalık', icon: '📊' },
            { key: 'monthly', label: 'Aylık', icon: '📈' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActivePeriod(key as Period)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                activePeriod === key
                  ? 'bg-blue-600 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Motivational Message */}
        <div className="bg-gradient-to-br from-blue-900/80 to-blue-800/70 border border-blue-500/30 rounded-2xl p-6 mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold">{t('analystSays')}</h2>
          </div>
          <p className="text-white/90 text-lg leading-relaxed">{motivationalMessage}</p>
        </div>

        {/* Stats Overview */}
        <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 19v-6l2-2 2 2v6h-4zm-2-8l2-2 2 2-2 2-2-2zm8-2l2-2 2 2-2 2-2-2z"/>
            </svg>
            {activePeriod === 'daily' ? 'Günlük' : activePeriod === 'weekly' ? 'Haftalık' : 'Aylık'} İstatistikler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
              label="Haber Okundu" 
              value={currentStats.newsRead} 
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                </svg>
              }
            />
            <StatCard 
              label="Yorum Yapıldı" 
              value={currentStats.commentsMade} 
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
              }
            />
            <StatCard 
              label="Quiz Tamamlandı" 
              value={currentStats.quizzesCompleted} 
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              }
            />
            <StatCard 
              label="XP Kazanıldı" 
              value={currentStats.xpEarned} 
              unit="XP"
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              }
            />
            <StatCard 
              label="Konu Takip Edildi" 
              value={currentStats.topicsFollowed} 
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              }
            />
            <StatCard 
              label="Streak Günü" 
              value={currentStats.streakDays} 
              unit="Gün"
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              }
            />
          </div>
        </div>

        {/* Current Status & Next Rank */}
        <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Mevcut Durum
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InfoItem label="Rütbe" value={`${currentRankInfo.name}`} />
              <InfoItem label="Lig" value={`${currentLeagueInfo.name}`} />
              <InfoItem label="Toplam XP" value={`${userProfile.xp} XP`} />
            </div>
            <div>
              {nextRankProgress && (
                <>
                  <h3 className="text-xl font-semibold mb-3">Sonraki Rütbe</h3>
                  <p className="text-white/80 mb-2">
                    {nextRankProgress.nextRank} rütbesine ulaşmak için {nextRankProgress.xpToNext} XP kaldı.
                  </p>
                  <ProgressBar progress={nextRankProgress.progressPercentage} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Başarılar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <span className="font-medium text-white">{achievement}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Analysis */}
        <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Kategori Analizi
          </h2>
          
          {/* Category Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...currentStats.categoryStats]
              .sort((a, b) => b.newsRead - a.newsRead)
              .map((category, index) => (
              <div key={category.categoryId} className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">{category.categoryName}</h3>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Haber Sayısı:</span>
                    <span className="text-white font-semibold">{category.newsRead}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Toplam Süre:</span>
                    <span className="text-white font-semibold">{category.totalTimeSpent} dk</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Ortalama:</span>
                    <span className="text-white font-semibold">
                      {category.newsRead > 0 ? Math.round(category.totalTimeSpent / category.newsRead) : 0} dk/haber
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Favori Zaman:</span>
                    <span className="text-white font-semibold">
                      {category.favoriteTimeOfDay === 'morning' ? 'Sabah' :
                       category.favoriteTimeOfDay === 'afternoon' ? 'Öğleden Sonra' :
                       category.favoriteTimeOfDay === 'evening' ? 'Akşam' : 'Gece'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Reading Chart */}
            <div className="h-64">
              <h3 className="text-lg font-semibold mb-3 text-white">Okuma Dağılımı</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...currentStats.categoryStats].sort((a, b) => b.newsRead - a.newsRead)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="categoryName" 
                    stroke="#9CA3AF" 
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar 
                    dataKey="newsRead" 
                    fill="#3B82F6"
                    radius={[2, 2, 0, 0]}
                    name="Haber Sayısı"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Reading Time Chart */}
            <div className="h-64">
              <h3 className="text-lg font-semibold mb-3 text-white">Okuma Süresi</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...currentStats.categoryStats].sort((a, b) => b.totalTimeSpent - a.totalTimeSpent)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="categoryName" 
                    stroke="#9CA3AF" 
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar 
                    dataKey="totalTimeSpent" 
                    fill="#10B981"
                    radius={[2, 2, 0, 0]}
                    name="Süre (dk)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
              Haftalık Aktivite
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" fontSize={10} />
                  <YAxis stroke="#9CA3AF" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                      fontSize: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="haber" 
                    stackId="1" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6}
                    name="Haber"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="yorum" 
                    stackId="1" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                    name="Yorum"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="xp" 
                    stackId="1" 
                    stroke="#F59E0B" 
                    fill="#F59E0B" 
                    fillOpacity={0.6}
                    name="XP"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Aktivite Dağılımı
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                      fontSize: '12px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-white/80">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* XP Progress Chart */}
        <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Rütbe İlerlemesi
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={xpProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="rank" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="threshold" fill="#374151" name="Gerekli XP" />
                <Bar dataKey="current" fill="#3B82F6" name="Mevcut XP" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Trend Chart */}
        <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
            Aylık Gelişim Trendi
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="xp" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  name="XP"
                />
                <Line 
                  type="monotone" 
                  dataKey="haber" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  name="Haber"
                />
                <Line 
                  type="monotone" 
                  dataKey="yorum" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
                  name="Yorum"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Öneriler
            </h2>
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3 text-white/80">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Link href={`/${locale}/games`} passHref>
            <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              Oyunları Oyna
            </button>
          </Link>
          <Link href={`/${locale}/dashboard`} passHref>
            <button className="bg-white/10 text-white font-semibold py-3 px-8 rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
              </svg>
              Haberleri Oku
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  unit?: string;
  icon: JSX.Element;
}

function StatCard({ label, value, unit = '', icon }: StatCardProps): JSX.Element {
  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
      <div className="flex items-center justify-center gap-2 mb-2 text-blue-400">
        {icon}
      </div>
      <p className="text-white/70 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value} {unit}</p>
    </div>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps): JSX.Element {
  return (
    <p className="text-white/80 mb-2">
      <span className="font-semibold text-white">{label}:</span> {value}
    </p>
  );
}

interface ProgressBarProps {
  progress: number;
}

function ProgressBar({ progress }: ProgressBarProps): JSX.Element {
  return (
    <div className="w-full bg-white/20 rounded-full h-3">
      <div
        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GameRecommendation } from '@/lib/types/game-recommendations';

interface GameRecommendationCardProps {
  recommendation: GameRecommendation;
}

const colorClasses = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/30',
    border: 'border-blue-400/30',
    accent: 'text-blue-400',
    hover: 'hover:border-blue-400/50',
    glow: 'hover:shadow-[0_36px_80px_rgba(59,130,246,0.15)]'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/30',
    border: 'border-purple-400/30',
    accent: 'text-purple-400',
    hover: 'hover:border-purple-400/50',
    glow: 'hover:shadow-[0_36px_80px_rgba(147,51,234,0.15)]'
  },
  green: {
    bg: 'bg-gradient-to-br from-green-500/20 to-green-600/30',
    border: 'border-green-400/30',
    accent: 'text-green-400',
    hover: 'hover:border-green-400/50',
    glow: 'hover:shadow-[0_36px_80px_rgba(34,197,94,0.15)]'
  },
  cyan: {
    bg: 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/30',
    border: 'border-cyan-400/30',
    accent: 'text-cyan-400',
    hover: 'hover:border-cyan-400/50',
    glow: 'hover:shadow-[0_36px_80px_rgba(6,182,212,0.15)]'
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30',
    border: 'border-yellow-400/30',
    accent: 'text-yellow-400',
    hover: 'hover:border-yellow-400/50',
    glow: 'hover:shadow-[0_36px_80px_rgba(234,179,8,0.15)]'
  },
  red: {
    bg: 'bg-gradient-to-br from-red-500/20 to-red-600/30',
    border: 'border-red-400/30',
    accent: 'text-red-400',
    hover: 'hover:border-red-400/50',
    glow: 'hover:shadow-[0_36px_80px_rgba(239,68,68,0.15)]'
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-500/20 to-orange-600/30',
    border: 'border-orange-400/30',
    accent: 'text-orange-400',
    hover: 'hover:border-orange-400/50',
    glow: 'hover:shadow-[0_36px_80px_rgba(249,115,22,0.15)]'
  }
};

const difficultyColors = {
  easy: 'text-green-400 bg-green-500/20',
  medium: 'text-yellow-400 bg-yellow-500/20',
  hard: 'text-red-400 bg-red-500/20'
};

const difficultyLabels = {
  easy: 'Kolay',
  medium: 'Orta',
  hard: 'Zor'
};

// Icon bileşenleri
const GameIcons = {
  quiz: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  lightning: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  map: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  text: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  ),
  brain: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  gamepad: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4v1m4-1v1m4-6V9a3 3 0 00-3-3H9a3 3 0 00-3 3v1M7 21h10a2 2 0 002-2v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2a2 2 0 002 2z" />
    </svg>
  )
};

export function GameRecommendationCard({ recommendation }: GameRecommendationCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const colors = colorClasses[recommendation.color];
  const IconComponent = GameIcons[recommendation.icon as keyof typeof GameIcons] || GameIcons.gamepad;

  const handleClick = () => {
    router.push(recommendation.href);
  };

  return (
    <article
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[28px] border ${colors.border} ${colors.bg} text-white shadow-[0_24px_56px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] ${colors.hover} ${colors.glow} cursor-pointer`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent mix-blend-overlay" aria-hidden />
      <div className="absolute inset-0 opacity-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
      
      {/* AI Recommendation Badge */}
      {recommendation.isRecommendedByAI && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 px-3 py-1.5 text-xs font-semibold text-purple-300 backdrop-blur-sm">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            AI Önerisi
          </div>
        </div>
      )}

      <div className="relative flex flex-1 flex-col gap-4 p-6">
        {/* Header - Simplified */}
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.accent} bg-white/10`}>
            <IconComponent />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
              {recommendation.title}
            </h3>
            {/* AI Recommendation Reason - Clean */}
            {recommendation.isRecommendedByAI && recommendation.aiRecommendationReason && (
              <div className="text-xs text-purple-300 mb-2">
                💡 {recommendation.aiRecommendationReason}
              </div>
            )}
            <p className="text-sm text-white/70 line-clamp-2 mb-2">
              {recommendation.description}
            </p>
            {/* Player count moved here */}
            <div className="flex items-center gap-1 text-xs text-white/60">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span>{recommendation.activePlayerCount} kişi oynuyor</span>
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className={`px-2 py-1 rounded-lg ${difficultyColors[recommendation.difficulty]}`}>
            {difficultyLabels[recommendation.difficulty]}
          </div>
          <div className="px-2 py-1 rounded-lg bg-white/10 text-white/70 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {recommendation.estimatedTime}
          </div>
          <div className={`px-2 py-1 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 ${colors.accent} flex items-center gap-1`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            +{recommendation.xpReward} XP
          </div>
        </div>

        {/* Personal Insights */}
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-3 border border-purple-400/20">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium text-purple-300">Kişisel Analiz</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              {recommendation.matchedCategories.slice(0, 2).join(' ve ')} konularına olan ilgini fark ettik. 
              Bu oyunda kendini test etmek ister misin?
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <div className={`font-bold text-lg ${colors.accent} mb-1`}>
                {Math.floor(Math.random() * 40 + 60)}%
              </div>
              <div className="text-white/60">Başarı şansın</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <div className={`font-bold text-lg ${colors.accent} mb-1`}>
                #{Math.floor(Math.random() * 50 + 10)}
              </div>
              <div className="text-white/60">Sıralama hedefin</div>
            </div>
          </div>
        </div>

        {/* Challenge or Streak Info */}
        {(recommendation.hasActiveChallenge || recommendation.streakContinuation) && (
          <div className="space-y-2">
            {recommendation.hasActiveChallenge && (
              <div className="flex items-center gap-2 text-xs text-orange-300 bg-orange-500/10 rounded-lg p-2 border border-orange-400/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Aktif challenge var - katıl ve ödül kazan!
              </div>
            )}
            {recommendation.streakContinuation && (
              <div className="flex items-center gap-2 text-xs text-green-300 bg-green-500/10 rounded-lg p-2 border border-green-400/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {recommendation.streakContinuation.currentStreak} günlük streak'ini devam ettir! (+{recommendation.streakContinuation.nextReward} XP)
              </div>
            )}
          </div>
        )}

        {/* Trend Info - Simplified */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-3 border border-orange-400/20">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-orange-300 font-medium">🔥 Trend</div>
            <div className="flex items-center gap-1 text-yellow-400 text-xs">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>4.8</span>
            </div>
          </div>
          <div className="text-xs text-white/80">
            Son 24 saatte {Math.floor(recommendation.activePlayerCount * 2.5)} kişi oynadı!
          </div>
        </div>

        {/* Call to Action - Improved */}
        <div className="mt-auto space-y-3">
          <button className={`
            w-full py-3.5 px-4 
            bg-gradient-to-r ${colors.button}
            rounded-xl text-white font-semibold text-center 
            transition-all duration-300 ease-out
            shadow-[0_8px_24px_rgba(0,0,0,0.3)] 
            hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]
            hover:shadow-blue-500/25
            transform hover:scale-[1.02] hover:-translate-y-0.5
            active:scale-[0.98] active:translate-y-0
            border border-white/10 hover:border-white/20
          `}>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4v1m4-1v1" />
              </svg>
              Hemen Başla
            </div>
          </button>
          <div className="text-center text-xs text-white/50 bg-white/5 rounded-lg py-2 px-3">
            ⏱️ {recommendation.estimatedTime} • ⭐ +{recommendation.xpReward} XP
          </div>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/85 to-black/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <div className={`${colors.accent} text-4xl`}>
            <IconComponent />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              {recommendation.title}
            </h4>
            <p className="text-white/80 text-sm mb-4">
              {recommendation.description}
            </p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white/20 to-white/10 rounded-full text-white font-medium border border-white/20`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4v1m4-1v1" />
              </svg>
              Hemen Oyna
            </div>
          </div>
        </div>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </article>
  );
}

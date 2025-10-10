'use client';

import { useState, useEffect, type JSX } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useGamification } from '@/contexts/gamification-context';
import { usePersonalAnalyst } from '@/contexts/personal-analyst-context';
import { RANK_THRESHOLDS, UserRank, LEAGUE_INFO, RANK_INFO } from '@/lib/types/gamification';

interface WelcomeScreenProps {
  isVisible: boolean;
  onClose: () => void;
}

export function WelcomeScreen({ isVisible, onClose }: WelcomeScreenProps): JSX.Element | null {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('welcomeScreen');
  const { userProfile } = useGamification();
  const { personalAnalystData, generatePersonalAnalystData, isLoading } = usePersonalAnalyst();

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      generatePersonalAnalystData();
      
      // 3 adımlı sunum için step değişimi
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % 3);
      }, 2000);
      
      return () => clearInterval(stepInterval);
    } else {
      setIsAnimating(false);
      setCurrentStep(0);
    }
  }, [isVisible, generatePersonalAnalystData]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 8000); // Auto-close after 8 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handlePlayGames = () => {
    router.push(`/${locale}/games`);
    onClose();
  };

  const handleViewAnalyst = () => {
    router.push(`/${locale}/analyst`);
    onClose();
  };

  if (!isVisible && !isAnimating) return null;

  const currentRankInfo = userProfile ? RANK_INFO[userProfile.currentRank] : null;
  const currentLeagueInfo = userProfile ? LEAGUE_INFO[userProfile.league] : null;

  const getNextRankProgress = () => {
    if (!userProfile) return null;

    const ranks = Object.values(UserRank);
    const currentIndex = ranks.indexOf(userProfile.currentRank);
    
    if (currentIndex === -1) return null;

    const nextRank = ranks[currentIndex + 1];
    if (!nextRank) return null; // Already at the highest rank

    const currentRankThreshold = RANK_THRESHOLDS[userProfile.currentRank];
    const nextRankThreshold = RANK_THRESHOLDS[nextRank];
    const xpNeededForNextRank = nextRankThreshold - currentRankThreshold;
    const xpEarnedInCurrentRank = userProfile.xp - currentRankThreshold;
    const progressPercentage = xpNeededForNextRank > 0 ? Math.min(100, Math.round((xpEarnedInCurrentRank / xpNeededForNextRank) * 100)) : 100;
    const xpToNext = nextRankThreshold - userProfile.xp;

    return {
      nextRank: RANK_INFO[nextRank].name,
      xpToNext: Math.max(0, xpToNext),
      progressPercentage,
    };
  };

  const nextRankProgress = getNextRankProgress();

  const steps = [
    {
      title: t('playGames'),
      description: t('playGamesDescription'),
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ),
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: t('nextRank'),
      description: nextRankProgress ? `${nextRankProgress.nextRank} rütbesine ${nextRankProgress.xpToNext} XP kaldı!` : 'Maksimum rütbeye ulaştın!',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      color: 'from-blue-500 to-purple-500'
    },
    {
      title: t('personalAnalyst'),
      description: 'Kişiselleştirilmiş analiz ve öneriler al',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 19v-6l2-2 2 2v6h-4zm-2-8l2-2 2 2-2 2-2-2zm8-2l2-2 2 2-2 2-2-2z"/>
        </svg>
      ),
      color: 'from-green-500 to-teal-500'
    }
  ];

  return (
    <div 
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-gradient-to-br from-blue-900/80 to-blue-800/70 border border-blue-500/30 rounded-3xl p-8 shadow-2xl max-w-2xl w-full mx-4 text-center transform transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Hoş Geldin, {userProfile?.name}! 
          </h1>
          <p className="text-white/80 text-lg">
            Kişisel analistin hazır! Bu haftaki performansını incele.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center space-x-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentStep ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Current Step Content */}
        <div className="mb-8">
          <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${steps[currentStep].color} rounded-full flex items-center justify-center mb-4`}>
            {steps[currentStep].icon}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-white/80 text-lg">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Personal Analyst Summary */}
        {isLoading ? (
          <div className="text-white/70 mb-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            Analiz hazırlanıyor...
          </div>
        ) : (
          <div className="bg-white/10 rounded-xl p-6 mb-8 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 19v-6l2-2 2 2v6h-4zm-2-8l2-2 2 2-2 2-2-2zm8-2l2-2 2 2-2 2-2-2z"/>
              </svg>
              Haftalık Özet
            </h3>
            {userProfile && personalAnalystData ? (
              <div className="grid grid-cols-2 gap-4 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                  </svg>
                  <span>{personalAnalystData.weeklyStats.newsRead} haber</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                  <span>{personalAnalystData.weeklyStats.commentsMade} yorum</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>{personalAnalystData.weeklyStats.xpEarned} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>{currentRankInfo?.name}</span>
                </div>
              </div>
            ) : (
              <p className="text-white/70">Veriler yükleniyor...</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePlayGames}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            {t('playGamesButton')}
          </button>
          
          <button
            onClick={handleViewAnalyst}
            className="w-full bg-white/10 text-white font-medium py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 19v-6l2-2 2 2v6h-4zm-2-8l2-2 2 2-2 2-2-2zm8-2l2-2 2 2-2 2-2-2z"/>
            </svg>
            {t('viewProfileButton')}
          </button>
        </div>

        {/* Auto-close hint */}
        <p className="text-white/50 text-xs mt-4">{t('closeHint')}</p>
      </div>
    </div>
  );
}
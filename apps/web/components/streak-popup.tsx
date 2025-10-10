'use client';

import { useState, useEffect, type JSX } from 'react';
import { useTranslations } from 'next-intl';
import { useGamification } from '@/contexts/gamification-context';

interface StreakPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

export function StreakPopup({ isVisible, onClose }: StreakPopupProps): JSX.Element | null {
  const [isAnimating, setIsAnimating] = useState(false);
  const t = useTranslations('streakPopup');
  const { userProfile, getStreakInfo } = useGamification();
  const streakInfo = getStreakInfo();

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !isAnimating) return null;

  const getStreakMessage = () => {
    if (streakInfo.currentStreak === 0) {
      return "Hadi başlayalım! İlk streak'ini oluştur!";
    } else if (streakInfo.currentStreak === 1) {
      return "Harika! İlk gününü tamamladın!";
    } else if (streakInfo.currentStreak < 7) {
      return `${streakInfo.currentStreak} günlük streak'in devam ediyor!`;
    } else if (streakInfo.currentStreak < 30) {
      return `Mükemmel! ${streakInfo.currentStreak} günlük streak'in harika!`;
    } else {
      return `İnanılmaz! ${streakInfo.currentStreak} günlük streak'in efsane!`;
    }
  };

  const getStreakReward = () => {
    if (streakInfo.currentStreak === 0) return 0;
    if (streakInfo.currentStreak < 7) return streakInfo.currentStreak * 5;
    if (streakInfo.currentStreak < 30) return streakInfo.currentStreak * 10;
    return streakInfo.currentStreak * 20;
  };

  const getStreakMilestones = () => {
    const milestones = [
      { days: 7, reward: 50, title: "1 Hafta" },
      { days: 30, reward: 200, title: "1 Ay" },
      { days: 100, reward: 500, title: "100 Gün" },
      { days: 365, reward: 1000, title: "1 Yıl" }
    ];
    
    return milestones.filter(milestone => milestone.days > streakInfo.currentStreak);
  };

  const streakReward = getStreakReward();
  const upcomingMilestones = getStreakMilestones();

  return (
    <div 
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-gradient-to-br from-orange-900/90 to-red-900/90 border border-orange-500/30 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 text-center transform transition-all duration-300 ${
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

        {/* Streak Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {t('title')}
          </h2>
          <p className="text-orange-200 text-lg">
            {getStreakMessage()}
          </p>
        </div>

        {/* Streak Stats */}
        <div className="bg-white/10 rounded-2xl p-6 mb-6 border border-white/20">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">{streakInfo.currentStreak}</div>
              <div className="text-orange-200 text-sm font-medium">{t('currentStreak')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">{streakInfo.longestStreak}</div>
              <div className="text-orange-200 text-sm font-medium">{t('longestStreak')}</div>
            </div>
          </div>
        </div>

        {/* Streak Reward */}
        {streakReward > 0 && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-yellow-300 font-semibold">{t('streakReward')}</span>
            </div>
            <div className="text-2xl font-bold text-white">+{streakReward} XP</div>
            <div className="text-yellow-200 text-sm">{t('motivationalMessage')}</div>
          </div>
        )}

        {/* Next Milestone */}
        {streakInfo.nextMilestone > 0 && (
          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <div className="text-center">
              <div className="text-orange-300 font-semibold mb-1">{t('nextMilestone')}</div>
              <div className="text-2xl font-bold text-white">{streakInfo.nextMilestone} gün</div>
              <div className="text-orange-200 text-sm">
                {streakInfo.nextMilestone - streakInfo.currentStreak} {t('daysRemaining')}
              </div>
            </div>
          </div>
        )}

        {/* Streak Protection */}
        {userProfile?.streakProtection > 0 && (
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 1z"/>
              </svg>
              <span className="text-purple-300 font-semibold">{t('streakProtection')}</span>
            </div>
            <div className="text-center text-purple-200 text-sm">
              {userProfile.streakProtection} {t('protectionRights')}
            </div>
          </div>
        )}

        {/* Upcoming Milestones */}
        {upcomingMilestones.length > 0 && (
          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <h3 className="text-orange-300 font-semibold mb-3 text-center">{t('upcomingMilestones')}</h3>
            <div className="space-y-2">
              {upcomingMilestones.slice(0, 2).map((milestone, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{milestone.days}</span>
                    </div>
                    <span className="text-white text-sm">{milestone.title}</span>
                  </div>
                  <div className="text-orange-300 text-sm font-medium">+{milestone.reward} XP</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivational Message */}
        <div className="text-center">
          <p className="text-white/80 text-sm leading-relaxed">
            {streakInfo.currentStreak === 0 
              ? "Her gün giriş yaparak streak'ini oluştur ve bonus XP kazan!"
              : "Harika! Streak'ini korumaya devam et ve daha fazla ödül kazan!"
            }
          </p>
        </div>

        {/* Auto-close hint */}
        <p className="text-white/50 text-xs mt-4">{t('autoCloseHint')}</p>
      </div>
    </div>
  );
}

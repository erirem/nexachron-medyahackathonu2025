'use client';

import { useState, useEffect, type JSX } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useNewsTracking } from '@/contexts/news-tracking-context';

interface TriviaPopupProps {
  isVisible: boolean;
  onClose: () => void;
  readPercentage: number;
  totalNewsCount: number;
}

export function TriviaPopup({ 
  isVisible, 
  onClose, 
  readPercentage, 
  totalNewsCount 
}: TriviaPopupProps): JSX.Element | null {
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('triviaPopup');
  const { dismissTriviaPopup } = useNewsTracking();

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  const handlePlayTrivia = () => {
    router.push(`/${locale}/games/news-trivia`);
    onClose();
  };

  const handleDismiss = () => {
    dismissTriviaPopup();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div 
        className={`relative bg-gradient-to-br from-amber-900/95 to-orange-800/95 border border-amber-500/30 rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('title')}
          </h2>
          <p className="text-white/90 text-lg">
            {t('description', { percentage: readPercentage })}
          </p>
        </div>

        {/* Progress info */}
        <div className="bg-white/10 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 text-sm">{t('progress')}</span>
            <span className="text-white font-semibold">
              {Math.round((readPercentage / 100) * totalNewsCount)}/{totalNewsCount}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${readPercentage}%` }}
            />
          </div>
        </div>

        {/* Description */}
        <div className="text-center mb-8">
          <p className="text-white/80 text-sm leading-relaxed">
            {t('message')}
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePlayTrivia}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            {t('playButton')}
          </button>
          
          <button
            onClick={handleDismiss}
            className="w-full bg-white/10 text-white font-medium py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-200"
          >
            {t('dismissButton')}
          </button>
        </div>

        {/* XP reward info */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {t('xpReward')}
          </div>
        </div>
      </div>
    </div>
  );
}

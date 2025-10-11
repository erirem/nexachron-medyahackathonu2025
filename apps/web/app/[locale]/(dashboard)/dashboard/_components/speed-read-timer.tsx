'use client';

import { useState, useEffect, useCallback, type JSX } from 'react';
import { useGamification } from '@/contexts/gamification-context';
import { XP_VALUES } from '@/lib/types/gamification';

interface SpeedReadTimerProps {
  readonly newsId: string;
  readonly onTimeExpired?: () => void;
  readonly onSpeedReadComplete?: () => void;
}

export function SpeedReadTimer({ 
  newsId, 
  onTimeExpired, 
  onSpeedReadComplete 
}: SpeedReadTimerProps): JSX.Element {
  const [timeLeft, setTimeLeft] = useState(2 * 60); // 2 minutes in seconds
  const [isActive, setIsActive] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const { completeSpeedRead } = useGamification();

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Hide tooltip on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowTooltip(false);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto hide tooltip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isActive || hasCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          onTimeExpired?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, hasCompleted, onTimeExpired]);

  const handleSpeedReadComplete = useCallback(() => {
    if (hasCompleted || !isActive) return;
    
    setHasCompleted(true);
    setIsActive(false);
    completeSpeedRead(newsId);
    onSpeedReadComplete?.();
  }, [hasCompleted, isActive, newsId, completeSpeedRead, onSpeedReadComplete]);

  // Listen for news completion events
  useEffect(() => {
    const handleNewsComplete = (event: CustomEvent) => {
      if (event.detail.newsId === newsId) {
        handleSpeedReadComplete();
      }
    };

    window.addEventListener('news-complete', handleNewsComplete as EventListener);
    return () => {
      window.removeEventListener('news-complete', handleNewsComplete as EventListener);
    };
  }, [newsId, handleSpeedReadComplete]);

  if (hasCompleted) {
    return (
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-full font-bold shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <span className="text-sm">+{XP_VALUES.SPEED_READ} XP</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-full font-bold shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">⏰</span>
            <span className="text-sm">Süre Doldu</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-10">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute -bottom-16 right-0 w-64 bg-black/90 backdrop-blur-sm text-white text-xs p-3 rounded-lg shadow-xl border border-white/20 animate-in fade-in duration-300">
          <div className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">💡</span>
            <div>
              <p className="font-semibold mb-1">Hızlı Okuma Modu</p>
              <p className="text-white/80 leading-relaxed">
                Bu süre içinde haberi okuyarak <span className="text-green-400 font-semibold">+{XP_VALUES.SPEED_READ} XP</span> kazanabilirsiniz!
              </p>
            </div>
          </div>
          {/* Arrow pointing up */}
          <div className="absolute -top-2 right-4 w-4 h-4 bg-black/90 border-t border-l border-white/20 rotate-45"></div>
        </div>
      )}
      
      <div className={`bg-gradient-to-r text-white px-3 py-2 rounded-full font-bold shadow-lg transition-all duration-300 ${
        timeLeft <= 60 
          ? 'from-red-500 to-pink-500 animate-pulse' 
          : timeLeft <= 120 
          ? 'from-orange-500 to-red-500' 
          : 'from-blue-500 to-purple-500'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span className="text-sm font-mono">{formatTime(timeLeft)}</span>
        </div>
      </div>
    </div>
  );
}

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
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);
  const { completeSpeedRead } = useGamification();

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

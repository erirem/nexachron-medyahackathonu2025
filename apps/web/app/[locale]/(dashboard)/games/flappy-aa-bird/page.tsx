'use client';

import { useState, useEffect, type JSX } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGamification } from '@/contexts/gamification-context';
import { SocialShareModal } from '@/components/social-share-modal';
import { FlappyAABirdGame } from '../_components/flappy-aa-bird-game';

export default function FlappyAABirdPage(): JSX.Element {
  const [isGameOpen, setIsGameOpen] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    bestScore: 0,
    totalScore: 0,
    totalXP: 0
  });
  const { userProfile, addXP } = useGamification();
  const router = useRouter();
  const t = useTranslations('games');

  // Load game stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('flappy-bird-stats');
    if (savedStats) {
      setGameStats(JSON.parse(savedStats));
    }
  }, []);

  const handleGameComplete = (score: number) => {
    // Store score for sharing
    setLastScore(score);
    
    // Calculate XP based on score
    const baseXp = 20;
    const bonusXp = Math.min(score * 2, 50); // Max 50 bonus XP
    const totalXp = baseXp + bonusXp;
    
    // Update game stats
    const newStats = {
      gamesPlayed: gameStats.gamesPlayed + 1,
      bestScore: Math.max(gameStats.bestScore, score),
      totalScore: gameStats.totalScore + score,
      totalXP: gameStats.totalXP + totalXp
    };
    
    setGameStats(newStats);
    localStorage.setItem('flappy-bird-stats', JSON.stringify(newStats));
    
    // Check if it's a new record
    const isNewRecord = score > gameStats.bestScore;
    setIsNewRecord(isNewRecord);
    
    if (isNewRecord) {
      localStorage.setItem('flappy-bird-high-score', score.toString());
    }
    
    addXP('QUIZ_COMPLETE', totalXp);
    
    // Close the game modal immediately
    setIsGameOpen(false);
  };

  const handleClose = () => {
    setIsGameOpen(false);
    router.back();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] text-[#f6f7fb] relative overflow-hidden">
      {/* Background Mascots */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left Mascot */}
        <div className="absolute left-4 top-1/4 opacity-35 transform -rotate-12 z-10">
          <img 
            src="/mascot.svg" 
            alt="AA Mascot" 
            className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64"
          />
        </div>
        
        {/* Right Mascot */}
        <div className="absolute right-4 top-1/3 opacity-35 transform rotate-12 z-20">
          <img 
            src="/mascot.svg" 
            alt="AA Mascot" 
            className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64"
          />
        </div>
        
        {/* Center Top Mascot */}
        <div className="absolute left-1/2 top-8 transform -translate-x-1/2 opacity-25 -rotate-6 z-5">
          <img 
            src="/mascot.svg" 
            alt="AA Mascot" 
            className="w-28 h-28 md:w-40 md:h-40 lg:w-48 lg:h-48"
          />
        </div>
        
        {/* Left Center Mascot */}
        <div className="absolute left-12 top-1/2 transform -translate-y-1/2 opacity-30 rotate-24 z-15">
          <img 
            src="/mascot.svg" 
            alt="AA Mascot" 
            className="w-24 h-24 md:w-36 md:h-36 lg:w-44 lg:h-44"
          />
        </div>
        
        {/* Right Center Mascot */}
        <div className="absolute right-12 top-3/4 transform -translate-y-1/2 opacity-30 -rotate-24 z-15">
          <img 
            src="/mascot.svg" 
            alt="AA Mascot" 
            className="w-24 h-24 md:w-36 md:h-36 lg:w-44 lg:h-44"
          />
        </div>
        
        {/* Bottom Left Mascot */}
        <div className="absolute left-1/4 bottom-1/4 opacity-20 transform rotate-45 z-5">
          <img 
            src="/mascot.svg" 
            alt="AA Mascot" 
            className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40"
          />
        </div>
        
        {/* Bottom Right Mascot */}
        <div className="absolute right-1/4 bottom-1/3 opacity-20 transform -rotate-45 z-5">
          <img 
            src="/mascot.svg" 
            alt="AA Mascot" 
            className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40"
          />
        </div>
        
        {/* Center Bottom Mascot */}
        <div className="absolute left-1/2 bottom-8 transform -translate-x-1/2 opacity-15 rotate-12 z-5">
          <img 
            src="/mascot.svg" 
            alt="AA Mascot" 
            className="w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36"
          />
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white/70 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('page.back')}
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <span className="text-5xl">🐦</span>
            <span>{t('gamesList.flappyAABird.title')}</span>
          </h1>
          <p className="text-[#8fb8ff] text-lg">
            {t('gamesList.flappyAABird.description')} {userProfile?.xp || 0} XP'niz var.
          </p>
        </div>

        {/* Game Stats */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">Oyun İstatistikleri</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">{gameStats.gamesPlayed}</div>
                <div className="text-sm text-white/60">Oynanan Oyun</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{gameStats.bestScore}</div>
                <div className="text-sm text-white/60">En İyi Skor</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{gameStats.totalScore}</div>
                <div className="text-sm text-white/60">Toplam Puan</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">{gameStats.totalXP}</div>
                <div className="text-sm text-white/60">Kazanılan XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* How to Play */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">Nasıl Oynanır</h2>
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">SPACE</div>
                <span>AA Kuşu'nu uçurmak için SPACE, W tuşuna basın veya tıklayın</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">🏆</div>
                <span>Puan kazanmak için borulardan kaçının</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold">⭐</div>
                <span>Daha yüksek skorlar daha fazla XP kazandırır</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsGameOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg text-white font-medium transition-all duration-200"
              >
                Oyunu Başlat
              </button>
            </div>
          </div>
        </div>

        {/* Flappy AA Bird Game Modal */}
        {isGameOpen && (
          <FlappyAABirdGame
            onComplete={handleGameComplete}
            onClose={handleClose}
          />
        )}

        {/* Share Button - show after game completion */}
        {!isGameOpen && lastScore > 0 && (
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setShowShareModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              {isNewRecord ? '🏆' : '🎉'} Başarımı Paylaş
            </button>
          </div>
        )}

        {/* Social Share Modal */}
        <SocialShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          gameType="flappy-bird"
          highScore={lastScore}
          isNewRecord={isNewRecord}
        />
      </div>
    </div>
  );
}

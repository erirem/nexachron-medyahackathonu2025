'use client';

import { useState, type JSX } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useGamification } from '@/contexts/gamification-context';
import { SocialShareModal } from '@/components/social-share-modal';
import { WordPuzzleGame } from '../_components/word-puzzle-game';

export default function WordPuzzlePage(): JSX.Element {
  const [isGameOpen, setIsGameOpen] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const { userProfile, addXP } = useGamification();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('games');

  const handleGameComplete = (score: number, wordsFound: number, timeSpent: number) => {
    // Store score for sharing
    setLastScore(score);
    
    // Check if it's a new record
    const previousHighScore = localStorage.getItem('word-puzzle-high-score');
    const highScore = previousHighScore ? parseInt(previousHighScore) : 0;
    const isNewRecord = score > highScore;
    setIsNewRecord(isNewRecord);
    
    if (isNewRecord) {
      localStorage.setItem('word-puzzle-high-score', score.toString());
    }
    
    // Calculate XP based on score and words found
    const baseXp = 20;
    const wordsBonus = wordsFound * 3; // 3 XP per word found
    const timeBonus = Math.max(0, Math.floor((600 - timeSpent) / 30)); // Bonus for speed
    const totalXp = baseXp + wordsBonus + timeBonus;
    
    addXP('QUIZ_COMPLETE', totalXp);
    
    // Close the game modal immediately
    setIsGameOpen(false);
    
    // Show completion message
    setTimeout(() => {
      alert(`🎉 Tebrikler! ${wordsFound} kelime buldunuz!\n+${totalXp} XP kazandınız!`);
    }, 1000);
  };

  const handleClose = () => {
    setIsGameOpen(false);
    router.back();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] text-[#f6f7fb] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="mb-6">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white/70 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('page.back')}
          </button>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">🔤 Kelime Bulmaca</h1>
          <p className="text-[#8fb8ff] text-lg">
            Harflerden kelimeler oluşturun ve kelime dağarcığınızı genişletin!
          </p>
        </div>

        {isGameOpen && (
          <WordPuzzleGame
            onComplete={handleGameComplete}
            onClose={handleClose}
            onShare={() => setShowShareModal(true)}
          />
        )}

        {showShareModal && (
          <SocialShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            gameType="quiz"
            score={lastScore}
            isNewRecord={isNewRecord}
          />
        )}
      </div>
    </div>
  );
}

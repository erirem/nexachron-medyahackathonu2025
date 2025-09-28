'use client';

import { useState, type JSX } from 'react';
import { useRouter } from 'next/navigation';
import { useGamification } from '@/contexts/gamification-context';
import { WordleGame } from '../_components/wordle-game';

export default function WordlePage(): JSX.Element {
  const [isGameOpen, setIsGameOpen] = useState(true);
  const { userProfile, addXp } = useGamification();
  const router = useRouter();

  const handleGameComplete = (isWon: boolean, attempts: number) => {
    if (isWon) {
      // Kazanma bonusu: daha az denemede kazanırsa daha fazla XP
      const baseXp = 35;
      const bonusXp = Math.max(0, (7 - attempts) * 5); // Her deneme için 5 XP bonus
      const totalXp = baseXp + bonusXp;
      
      addXp(totalXp, 'wordle_win');
      
      // Başarı mesajı göster
      setTimeout(() => {
        alert(`🎉 Tebrikler! ${attempts} denemede kazandınız!\n+${totalXp} XP kazandınız!`);
      }, 1000);
    } else {
      // Kaybetme durumunda da az XP ver
      addXp(5, 'wordle_attempt');
      
      setTimeout(() => {
        alert(`😔 Kelimeyi bulamadınız.\n+5 XP kazandınız!`);
      }, 1000);
    }
  };

  const handleClose = () => {
    setIsGameOpen(false);
    router.back();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] text-[#f6f7fb]">
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white/70 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Geri Dön
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <span className="text-5xl">📝</span>
            <span>Wordle</span>
          </h1>
          <p className="text-[#8fb8ff] text-lg">
            5 harfli Türkçe kelimeyi 6 denemede bulun! {userProfile?.xp || 0} XP'niz var.
          </p>
        </div>

        {/* Game Stats */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">Oyun İstatistikleri</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">0</div>
                <div className="text-sm text-white/60">Oynanan</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">0</div>
                <div className="text-sm text-white/60">Kazanılan</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">0</div>
                <div className="text-sm text-white/60">Seri</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">0</div>
                <div className="text-sm text-white/60">En İyi Seri</div>
              </div>
            </div>
          </div>
        </div>

        {/* How to Play */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">Nasıl Oynanır?</h2>
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">A</div>
                <span>Doğru harf, doğru pozisyon</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold">B</div>
                <span>Doğru harf, yanlış pozisyon</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center text-white text-xs font-bold">C</div>
                <span>Harf kelimede yok</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsGameOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg text-white font-medium transition-all duration-200"
              >
                Oyunu Başlat
              </button>
            </div>
          </div>
        </div>

        {/* Wordle Game Modal */}
        {isGameOpen && (
          <WordleGame
            onComplete={handleGameComplete}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}

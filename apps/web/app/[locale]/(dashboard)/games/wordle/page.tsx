'use client';

import { useState, type JSX } from 'react';
import { useRouter } from 'next/navigation';
import { useGamification } from '@/contexts/gamification-context';
import { SocialShareModal } from '@/components/social-share-modal';
import { WordleGame } from '../_components/wordle-game';

export default function WordlePage(): JSX.Element {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [dailyMode, setDailyMode] = useState(true);
  const { userProfile, addXP } = useGamification();
  const router = useRouter();

  const handleGameComplete = (isWon: boolean, attempts: number, stats: any) => {
    if (isWon) {
      // Kazanma bonusu: daha az denemede kazanırsa daha fazla XP
      const baseXp = 35;
      const bonusXp = Math.max(0, (7 - attempts) * 5); // Her deneme için 5 XP bonus
      const streakBonus = Math.min(stats.currentStreak * 2, 20); // Seri bonusu (max 20)
      const totalXp = baseXp + bonusXp + streakBonus;
      
      // Gamification sisteminde özel bir aksiyon tipi yerine custom XP ile veriyoruz
      addXP('QUIZ_COMPLETE', totalXp);
      
      // Başarı mesajı göster
      setTimeout(() => {
        alert(`🎉 Tebrikler! ${attempts} denemede kazandınız!\n+${totalXp} XP kazandınız!\nSeri: ${stats.currentStreak}`);
      }, 1000);
    } else {
      // Kaybetme durumunda da az XP ver
      addXP('QUIZ_COMPLETE', 5);
      
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-2 space-y-4">
        {/* Back Button */}
            <div>
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

            {/* Daily Challenge */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Günlük Meydan Okuma
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Bugünkü Kelime</span>
                  <span className="text-green-400 font-medium text-sm">Hazır</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Sıradaki Kelime</span>
                  <span className="text-blue-400 font-medium text-sm">23:45</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Haftalık Seri</span>
                  <span className="text-yellow-400 font-medium text-sm">3/7</span>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Liderlik Tablosu
              </h3>
              <div className="space-y-2">
                {[
                  { name: 'Ahmet Y.', streak: 12, rank: 1 },
                  { name: 'Ayşe K.', streak: 10, rank: 2 },
                  { name: 'Mehmet S.', streak: 8, rank: 3 },
                  { name: 'Fatma A.', streak: 7, rank: 4 },
                  { name: 'Sen', streak: 5, rank: 5 }
                ].map((player, index) => (
                  <div key={index} className={`flex items-center justify-between p-2 rounded ${
                    player.name === 'Sen' ? 'bg-blue-500/20 border border-blue-400/30' : 'bg-white/5'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        player.rank === 1 ? 'bg-yellow-500 text-black' :
                        player.rank === 2 ? 'bg-gray-400 text-black' :
                        player.rank === 3 ? 'bg-orange-500 text-black' :
                        'bg-white/20 text-white'
                      }`}>
                        {player.rank}
                      </div>
                      <span className="text-white/80 text-sm">{player.name}</span>
                    </div>
                    <span className="text-green-400 font-medium text-sm">{player.streak}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                İpuçları
              </h3>
              <div className="space-y-2 text-xs text-white/70">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Yaygın harflerle başlayın</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  <span>Sarı harfleri farklı pozisyonlarda deneyin</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Gri harfleri tekrar kullanmayın</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Türkçe kelime yapısını düşünün</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
        {/* Header */}
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            <span>Wordle</span>
          </h1>
              <p className="text-[#8fb8ff]">
            5 harfli Türkçe kelimeyi 6 denemede bulun! {userProfile?.xp || 0} XP&apos;niz var.
          </p>
        </div>

        {/* Game Stats */}
            <div className="mb-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-3 text-center">Oyun İstatistikleri</h2>
                <div className="grid grid-cols-4 gap-3 text-center mb-4">
                  <div>
                    <div className="text-xl font-bold text-blue-400">
                      {typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('wordle-stats') || '{"gamesPlayed":0}').gamesPlayed : 0}
                    </div>
                    <div className="text-xs text-white/60">Oynanan</div>
                  </div>
              <div>
                    <div className="text-xl font-bold text-green-400">
                      {typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('wordle-stats') || '{"gamesWon":0}').gamesWon : 0}
                    </div>
                    <div className="text-xs text-white/60">Kazanılan</div>
              </div>
              <div>
                    <div className="text-xl font-bold text-yellow-400">
                      {typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('wordle-stats') || '{"currentStreak":0}').currentStreak : 0}
                    </div>
                    <div className="text-xs text-white/60">Seri</div>
              </div>
              <div>
                    <div className="text-xl font-bold text-purple-400">
                      {typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('wordle-stats') || '{"maxStreak":0}').maxStreak : 0}
                    </div>
                    <div className="text-xs text-white/60">En İyi Seri</div>
                  </div>
                </div>
                
                {/* Guess Distribution */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2 text-center">Tahmin Dağılımı</h3>
                  <div className="space-y-1">
                    {[1, 2, 3, 4, 5, 6].map((guess) => {
                      const stats = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('wordle-stats') || '{"guessDistribution":[0,0,0,0,0,0]}') : {guessDistribution: [0,0,0,0,0,0]};
                      const count = stats.guessDistribution[guess - 1] || 0;
                      const maxCount = Math.max(...stats.guessDistribution);
                      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      
                      return (
                        <div key={guess} className="flex items-center gap-2">
                          <div className="w-4 text-xs text-white/70">{guess}</div>
                          <div className="flex-1 bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-6 text-xs text-white/70">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Game Settings */}
            <div className="mb-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-3 text-center">Oyun Ayarları</h2>
                
                {/* Difficulty */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white mb-2 text-center">Zorluk Seviyesi</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'easy', label: 'Kolay', attempts: '8', color: 'green' },
                      { key: 'medium', label: 'Orta', attempts: '6', color: 'blue' },
                      { key: 'hard', label: 'Zor', attempts: '5', color: 'red' }
                    ].map((level) => (
                      <button
                        key={level.key}
                        onClick={() => setDifficulty(level.key as any)}
                        className={`p-2 rounded-lg border transition-all text-sm ${
                          difficulty === level.key
                            ? `border-${level.color}-400 bg-${level.color}-500/20 text-${level.color}-400`
                            : 'border-white/20 bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        <div className="font-medium">{level.label}</div>
                        <div className="text-xs opacity-70">{level.attempts} deneme</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Mode */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setDailyMode(true)}
                    className={`p-2 rounded-lg border transition-all text-sm ${
                      dailyMode
                        ? 'border-purple-400 bg-purple-500/20 text-purple-400'
                        : 'border-white/20 bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Günlük
                    </div>
                  </button>
                  <button
                    onClick={() => setDailyMode(false)}
                    className={`p-2 rounded-lg border transition-all text-sm ${
                      !dailyMode
                        ? 'border-blue-400 bg-blue-500/20 text-blue-400'
                        : 'border-white/20 bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Rastgele
                    </div>
                  </button>
                </div>

                {/* How to Play */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white mb-2 text-center">Nasıl Oynanır?</h3>
                  <div className="space-y-2 text-xs text-white/70">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">A</div>
                      <span>Doğru harf, doğru pozisyon</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold">B</div>
                      <span>Doğru harf, yanlış pozisyon</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-600 rounded flex items-center justify-center text-white text-xs font-bold">C</div>
                      <span>Harf kelimede yok</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => setIsGameOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg text-white font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Oyunu Başlat
                  </button>
                </div>
            </div>
          </div>
        </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            {/* Recent Games */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Son Oyunlar
              </h3>
              <div className="space-y-2">
                {[
                  { word: 'KALEM', attempts: 3, won: true, date: 'Bugün' },
                  { word: 'MASAL', attempts: 5, won: true, date: 'Dün' },
                  { word: 'GUNES', attempts: 6, won: false, date: '2 gün önce' },
                  { word: 'AYDIN', attempts: 4, won: true, date: '3 gün önce' }
                ].map((game, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded bg-white/5">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        game.won ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {game.won ? (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{game.word}</div>
                        <div className="text-white/60 text-xs">{game.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-medium ${
                        game.won ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {game.attempts}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Başarılar
              </h3>
              <div className="space-y-2">
                {[
                  { 
                    name: 'İlk Zafer', 
                    description: 'İlk oyunu kazan', 
                    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2L3 7v11c0 5.55 3.84 8 7 8s7-2.45 7-8V7l-7-5zM8 11l2 2 4-4-1.5-1.5L10 10l-.5-.5L8 11z" clipRule="evenodd" /></svg>, 
                    unlocked: true 
                  },
                  { 
                    name: 'Seri Ustası', 
                    description: '5 oyun üst üste kazan', 
                    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" /></svg>, 
                    unlocked: true 
                  },
                  { 
                    name: 'Hızlı Çözücü', 
                    description: '3 denemede çöz', 
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, 
                    unlocked: false 
                  },
                  { 
                    name: 'Kelime Ustası', 
                    description: '100 oyun oyna', 
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, 
                    unlocked: false 
                  }
                ].map((achievement, index) => (
                  <div key={index} className={`flex items-center gap-2 p-2 rounded text-sm ${
                    achievement.unlocked ? 'bg-green-500/20 border border-green-400/30' : 'bg-white/5 opacity-50'
                  }`}>
                    <div className={`${achievement.unlocked ? 'text-green-400' : 'text-white/30'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        achievement.unlocked ? 'text-white' : 'text-white/50'
                      }`}>
                        {achievement.name}
                      </div>
                      <div className={`text-xs ${
                        achievement.unlocked ? 'text-white/70' : 'text-white/40'
                      }`}>
                        {achievement.description}
                      </div>
                    </div>
                    {achievement.unlocked && (
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Word Categories */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Kelime Kategorileri
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Doğa', count: 45, color: 'green' },
                  { name: 'Hayvan', count: 32, color: 'orange' },
                  { name: 'Yiyecek', count: 28, color: 'red' },
                  { name: 'Renk', count: 15, color: 'purple' },
                  { name: 'Meslek', count: 22, color: 'blue' },
                  { name: 'Spor', count: 18, color: 'yellow' }
                ].map((category, index) => (
                  <div key={index} className={`p-2 rounded bg-${category.color}-500/20 border border-${category.color}-400/30`}>
                    <div className="text-white font-medium text-xs">{category.name}</div>
                    <div className={`text-${category.color}-400 text-xs`}>{category.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Wordle Game Modal */}
        {isGameOpen && (
          <WordleGame
            onComplete={handleGameComplete}
            onClose={handleClose}
            difficulty={difficulty}
            dailyMode={dailyMode}
          />
        )}

        {/* Social Share Modal */}
        <SocialShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          gameType="wordle"
          word={lastGameResult?.word || ''}
          attempts={lastGameResult?.attempts || 0}
        />
      </div>
    </div>
  );
}
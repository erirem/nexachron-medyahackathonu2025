'use client';

import { useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { newsItems } from '../../dashboard/_components/news-data';
import type { DashboardNewsItem } from '../../dashboard/_components/types';
import { TurkeyMap } from '../_components/turkey-map-d3';
import { getSupabaseClient } from '@/lib/supabase/client';
import turkeyCitiesData from 'turkey-cities-data';

function buildOptions(from: readonly DashboardNewsItem[], correctCity: string, seed: string): string[] {
  const cities = Array.from(
    new Set(
      from
        .map((n) => n.dateline)
        .filter(Boolean)
    )
  ).filter((c) => c !== correctCity);
  const seeded = seededShuffle(cities, seed);
  const distractors = seeded.slice(0, 3);
  return seededShuffle([correctCity, ...distractors], `${seed}:opts`);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Deterministic shuffle utilities for multiplayer so everyone sees the same items order
function hashStringToSeed(input: string): number {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seedString: string): T[] {
  const rand = mulberry32(hashStringToSeed(seedString));
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Motivasyon mesajları
const motivationMessages = {
  correct: ["Harika gidiyorsun!", "Mükemmel!", "Devam et!", "Süpersin!", "Harika bir tahmin!", "Çok iyisin!"],
  wrong: ["Bir dahaki sefere!", "Pes etme!", "Öğreniyorsun!", "Denemeye devam!", "Başarısızlık başarının ta kendisidir!", "Denemek önemli!"],
  win: ["Şampiyon!", "Rakibini geçtin!", "Harikasın!", "Efsanesin!", "Tam bir uzman!", "Muhteşemsin!"],
  lose: ["Vazgeçme!", "Bir sonrakinde!", "Daha iyisini yaparsın!", "Çalışmaya devam!", "Seni durduramayacaklar!", "Her kayıp bir ders!"],
  draw: ["İyi mücadele!", "Dengeli!", "İkiniz de harikasınız!", "Eşit güçtesiniz!", "Mükemmel bir eşleşme!", "Adil bir sonuç!"]
};

// Rastgele motivasyon mesajı al
function getRandomMotivation(type: keyof typeof motivationMessages): string {
  const messages = motivationMessages[type];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Icon Components
const TrophyIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" />
  </svg>
);

const CelebrationIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
  </svg>
);

const ThumbsUpIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
  </svg>
);

const MuscleIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
  </svg>
);

const HandshakeIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

const SadFaceIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 0 0-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634Zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 0 1-.189-.866c0-.298.059-.605.189-.866Zm-4.34 7.964a.75.75 0 0 1-1.061-1.06 5.236 5.236 0 0 1 3.73-1.538 5.236 5.236 0 0 1 3.695 1.538.75.75 0 1 1-1.061 1.06 3.736 3.736 0 0 0-2.639-1.098 3.736 3.736 0 0 0-2.664 1.098Z" clipRule="evenodd" />
  </svg>
);

const StarIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
);

// Toast component
interface ToastProps {
  message: string;
  show: boolean;
}

function Toast({ message, show }: ToastProps): JSX.Element | null {
  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-slide-in-top">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-glow">
        <StarIcon className="w-6 h-6" />
        <span className="font-bold text-lg">{message}</span>
      </div>
    </div>
  );
}

// FinalResultsModal component
interface FinalResultsModalProps {
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  onClose: () => void;
  onReplay: () => void;
}

function FinalResultsModal({ correctCount, wrongCount, totalQuestions, onClose, onReplay }: FinalResultsModalProps): JSX.Element {
  const [showToast, setShowToast] = useState(false);
  const totalXP = correctCount * 10;
  const successRate = Math.round((correctCount / totalQuestions) * 100);

  const handleClaimXP = () => {
    // Toast göster
    setShowToast(true);

    // 2 saniye sonra toast'ı kapat ve sayfayı kapat
    setTimeout(() => {
      setShowToast(false);
      setTimeout(() => {
        onClose();
      }, 300);
    }, 2000);
  };

  // Başarı oranına göre mesaj ve renk
  let performanceConfig: {
    gradient: string;
    icon: JSX.Element;
    title: string;
    message: string;
  };

  if (successRate >= 80) {
    performanceConfig = {
      gradient: 'from-yellow-400 to-amber-500',
      icon: <TrophyIcon className="w-16 h-16 text-white" />,
      title: 'Mükemmel Performans!',
      message: 'Harika bir performans sergileyerek oyunu tamamladın!'
    };
  } else if (successRate >= 60) {
    performanceConfig = {
      gradient: 'from-green-500 to-emerald-600',
      icon: <CelebrationIcon className="w-16 h-16 text-white" />,
      title: 'Çok İyi!',
      message: 'Güzel bir başarı! Devam edersen daha da iyisini yaparsın.'
    };
  } else if (successRate >= 40) {
    performanceConfig = {
      gradient: 'from-blue-500 to-cyan-600',
      icon: <ThumbsUpIcon className="w-16 h-16 text-white" />,
      title: 'İyi Deneme!',
      message: 'Fena değil! Biraz daha pratikle çok daha iyisini yapabilirsin.'
    };
  } else {
    performanceConfig = {
      gradient: 'from-purple-500 to-indigo-600',
      icon: <MuscleIcon className="w-16 h-16 text-white" />,
      title: 'Daha İyi Olabilir!',
      message: 'Pes etme! Her oyun bir öğrenme fırsatı.'
    };
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in pointer-events-auto px-4">
      <div className={`relative bg-gradient-to-br ${performanceConfig.gradient} rounded-2xl p-6 shadow-2xl max-w-md w-full animate-scale-in animate-bounce-finite`}>
        {/* Icon */}
        <div className="flex justify-center mb-3">{performanceConfig.icon}</div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-1">Oyun Bitti!</h2>
        <h3 className="text-lg font-semibold text-white/90 text-center mb-3">{performanceConfig.title}</h3>

        {/* Message */}
        <p className="text-white/90 text-center text-sm mb-4">{performanceConfig.message}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-white/70 text-xs mb-1">Toplam Soru</div>
            <div className="text-white font-bold text-2xl">{totalQuestions}</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-white/70 text-xs mb-1">Başarı Oranı</div>
            <div className="text-white font-bold text-2xl">{successRate}%</div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/90 text-sm">Doğru Cevaplar:</span>
            <span className="text-green-300 font-bold text-xl">{correctCount}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/90 text-sm">Yanlış Cevaplar:</span>
            <span className="text-red-300 font-bold text-xl">{wrongCount}</span>
          </div>
          <div className="border-t border-white/20 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold text-sm">Toplam XP Kazancı:</span>
              <span className="text-yellow-300 font-bold text-2xl">+{totalXP} XP</span>
            </div>
            <p className="text-white/60 text-xs text-right mt-1">({correctCount} doğru × 10 XP)</p>
          </div>
        </div>

        {/* Achievement Badge */}
        {successRate === 100 && (
          <div className="bg-white/10 backdrop-blur rounded-lg p-2.5 mb-3 text-center animate-glow">
            <div className="flex justify-center mb-1">
              <StarIcon className="w-8 h-8 text-yellow-300" />
            </div>
            <div className="text-white font-bold text-sm">Mükemmel Skor!</div>
            <div className="text-white/70 text-xs">Tüm soruları doğru bildin!</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`grid gap-3 ${totalXP > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {/* Tekrar Oyna Button */}
          <button
            onClick={onReplay}
            disabled={showToast}
            className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold text-base transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Tekrar Oyna</span>
            <span className="sm:hidden">Tekrar</span>
          </button>

          {/* XP Al ve Çık Button - Sadece XP > 0 ise göster */}
          {totalXP > 0 && (
            <button
              onClick={handleClaimXP}
              disabled={showToast}
              className="px-4 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold text-base transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              {showToast ? (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">XP Alındı!</span>
                  <span className="sm:hidden">Alındı!</span>
                </>
              ) : (
                <>
                  <StarIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">{totalXP} XP Al</span>
                  <span className="sm:hidden">{totalXP} XP</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Toast Message */}
      <Toast message={`+${totalXP} XP Kazandın!`} show={showToast} />
    </div>
  );
}

// ResultModal component
interface ResultModalProps {
  mode: 'single' | 'multi';
  lastResult: 'correct' | 'wrong';
  roundOutcome: 'win' | 'lose' | 'draw' | null;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  correctCity?: string;
  onClose: () => void;
}

function ResultModal({ mode, lastResult, roundOutcome, correctCount, wrongCount, totalQuestions, correctCity, onClose }: ResultModalProps): JSX.Element {
  // Duruma göre konfigürasyon
  let config: {
    gradient: string;
    icon: JSX.Element;
    title: string;
    motivation: string;
    animationClass: string;
  };

  if (mode === 'multi' && roundOutcome) {
    if (roundOutcome === 'win') {
      config = {
        gradient: 'from-yellow-400 to-amber-500',
        icon: <TrophyIcon className="w-12 h-12 text-white" />,
        title: 'Kazandın!',
        motivation: getRandomMotivation('win'),
        animationClass: 'animate-bounce animate-glow'
      };
    } else if (roundOutcome === 'lose') {
      config = {
        gradient: 'from-purple-500 to-indigo-600',
        icon: <MuscleIcon className="w-12 h-12 text-white" />,
        title: 'Bu Sefer Olmadı',
        motivation: getRandomMotivation('lose'),
        animationClass: 'animate-shake'
      };
    } else {
      config = {
        gradient: 'from-blue-500 to-cyan-600',
        icon: <HandshakeIcon className="w-12 h-12 text-white" />,
        title: 'Berabere!',
        motivation: getRandomMotivation('draw'),
        animationClass: 'animate-glow animate-wave'
      };
    }
  } else {
    if (lastResult === 'correct') {
      config = {
        gradient: 'from-green-500 to-emerald-600',
        icon: <CelebrationIcon className="w-12 h-12 text-white" />,
        title: 'Tebrikler! Doğru Bildiniz!',
        motivation: getRandomMotivation('correct'),
        animationClass: 'animate-bounce animate-glow'
      };
    } else {
      config = {
        gradient: 'from-red-500 to-rose-600',
        icon: <SadFaceIcon className="w-12 h-12 text-white" />,
        title: 'Üzgünüz, Yanlış Cevap',
        motivation: getRandomMotivation('wrong'),
        animationClass: 'animate-shake'
      };
    }
  }

  // XP hesaplama: Sadece doğru cevap durumunda XP ver
  const earnedXP = lastResult === 'correct' ? 10 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in pointer-events-auto">
      <div className={`relative bg-gradient-to-br ${config.gradient} rounded-2xl p-8 shadow-2xl max-w-md w-[90%] animate-scale-in ${config.animationClass}`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-all hover:rotate-90 duration-300"
          aria-label="Kapat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">{config.icon}</div>

        {/* Title */}
        <h3 className="text-3xl font-bold text-white text-center mb-3">{config.title}</h3>

        {/* Motivation Message */}
        <p className="text-white/90 text-center text-lg mb-4">{config.motivation}</p>

        {/* Stats */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/90">Doğru:</span>
            <span className="text-green-300 font-bold text-lg">{correctCount}</span>
          </div>
          {lastResult === 'wrong' && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/90">Yanlış:</span>
              <span className="text-red-300 font-bold text-lg">{wrongCount}</span>
            </div>
          )}
          <div className="flex justify-between items-center border-t border-white/20 pt-2">
            <span className="text-white/90 font-semibold">Toplam Skor:</span>
            <span className="text-white font-bold text-xl">{correctCount}/{totalQuestions}</span>
          </div>
        </div>

        {/* Correct Answer for Wrong - Sadece yanlış cevap durumunda göster */}
        {lastResult === 'wrong' && correctCity && (
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center mb-3">
            <p className="text-white/70 text-sm mb-1">Doğru Cevap:</p>
            <p className="text-white font-bold text-lg">{correctCity}</p>
          </div>
        )}

        {/* XP Info - Sadece doğru cevap durumunda göster */}
        {lastResult === 'correct' && earnedXP > 0 && (
          <div className="text-center text-white/90 text-base mt-3 mb-2">
            <div className="inline-block bg-white/10 px-4 py-2 rounded-full">
              <span className="font-bold text-yellow-300">+{earnedXP} XP</span> kazandın! 🌟
            </div>
            <p className="text-white/60 text-xs mt-2">(Doğru cevap × 10 XP)</p>
          </div>
        )}

        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="w-full mt-4 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold transition-all hover:scale-105"
        >
          Devam Et
        </button>
      </div>
    </div>
  );
}

export default function NewsGuessrPage(): JSX.Element {
  const t = useTranslations('newsGuessr');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [lastResult, setLastResult] = useState<null | 'correct' | 'wrong'>(null);
  const [showFinal, setShowFinal] = useState(false);
  const [mode, setMode] = useState<'none' | 'single' | 'multi'>('none');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [opponentGuess, setOpponentGuess] = useState<string | null>(null);
  const [roundOutcome, setRoundOutcome] = useState<null | 'win' | 'lose' | 'draw'>(null);
  const [selfGuesses, setSelfGuesses] = useState<Array<{ idx: number; guess: string; correct: boolean }>>([]);
  const [opponentGuesses, setOpponentGuesses] = useState<Array<{ idx: number; guess: string; correct: boolean }>>([]);
  const [showNewsPreview, setShowNewsPreview] = useState(true);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const clientIdRef = useRef<string>(Math.random().toString(36).slice(2));
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabaseClient>['channel']> | null>(null);
  const roundResolvedRef = useRef<boolean>(false);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advancingRef = useRef<boolean>(false);
  const mockOppTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef<number>(0);
  const selfSelectIndexRef = useRef<number | null>(null);
  const opponentSelectIndexRef = useRef<number | null>(null);
  const scheduledIndexRef = useRef<number | null>(null);
  const scheduledOnceRef = useRef<boolean>(false);
  const debug = (...args: unknown[]) => console.log('[NewsGuessr]', ...args);

  // Room detection from URL
  useEffect(() => {
    const room = searchParams.get('room');
    if (room && mode === 'none') {
      setMode('multi');
      setRoomId(room);
    }
  }, [searchParams, mode]);

  // Preview timer effect - sadece oyun başladıktan sonra
  useEffect(() => {
    if (!gameStarted) return;

    setShowNewsPreview(true);
    setPreviewProgress(0);

    // Progress bar için interval (50ms'de bir güncelle)
    const progressInterval = setInterval(() => {
      setPreviewProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1; // 50ms * 100 = 5000ms için %1 artış
      });
    }, 50);

    // 5 saniye sonra preview'ı kapat
    const timer = setTimeout(() => {
      setShowNewsPreview(false);
      clearInterval(progressInterval);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [index, gameStarted]);

  const items = useMemo(() => {
    const validCities = new Set(turkeyCitiesData.map(city => city.label));
    const candidates = newsItems.filter((n) => !!n.dateline && !!n.imageUrl && validCities.has(n.dateline));
    const base = seededShuffle(candidates, roomId || 'single').slice(0, 6);
    return base.map((n) => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      imageUrl: n.imageUrl,
      city: n.dateline,
      options: buildOptions(candidates, n.dateline, String(n.id)),
    }));
  }, [roomId]);
  const current = items[index];

  useEffect(() => {
    debug('index change → reset state', { index });
    setSelected(null);
    setShowResult(false);
    setOpponentGuess(null);
    setRoundOutcome(null);
    roundResolvedRef.current = false;
    advancingRef.current = false;
    indexRef.current = index;
    selfSelectIndexRef.current = null;
    opponentSelectIndexRef.current = null;
    scheduledIndexRef.current = null;
    scheduledOnceRef.current = false;
    if (advanceTimeoutRef.current) {
      debug('clear advanceTimeout');
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    if (mockOppTimeoutRef.current) {
      debug('clear mockOppTimeout');
      clearTimeout(mockOppTimeoutRef.current);
      mockOppTimeoutRef.current = null;
    }
  }, [index]);

  // Multiplayer realtime setup
  useEffect(() => {
    if (mode !== 'multi' || !roomId) {
      return;
    }
    const supabase = getSupabaseClient();
    const channel = supabase.channel(`news-guessr:${roomId}`);
    channel.on('broadcast', { event: 'selection' }, (payload) => {
      const data = payload.payload as { idx: number; guess: string; clientId: string };
      // Ignore own events
      if (data.clientId === clientIdRef.current) return;
      if (data.idx !== indexRef.current) return;
      if (mockOppTimeoutRef.current) {
        clearTimeout(mockOppTimeoutRef.current);
        mockOppTimeoutRef.current = null;
      }
      opponentSelectIndexRef.current = data.idx;
      setOpponentGuess((prev) => prev ?? data.guess);
    });
    channel.subscribe();
    channelRef.current = channel;
    return () => {
      channelRef.current = null;
      channel.unsubscribe();
    };
  }, [mode, roomId]);

  const handleSelect = (option: string) => {
    if (selected) return;
    debug('handleSelect', { mode, option, index });
    setSelected(option);
    selfSelectIndexRef.current = index;
    const correct = option === current.city;
    if (mode === 'single') {
      if (correct) {
        setScore((s) => s + 1);
        setCorrectCount((c) => c + 1);
        setLastResult('correct');
      } else {
        setWrongCount((c) => c + 1);
        setLastResult('wrong');
      }
      setSelfGuesses((arr) => (arr.some((g) => g.idx === index) ? arr : [...arr, { idx: index, guess: option, correct }]));
      setShowResult(true);
      scheduleAdvance(1000);
    } else if (mode === 'multi') {
      // Send selection to room
      debug('broadcast selection → send', { index, option });
      channelRef.current?.send({
        type: 'broadcast',
        event: 'selection',
        payload: { idx: index, guess: option, clientId: clientIdRef.current },
      });
      // TEMP MOCK: if no opponent guess arrives shortly, generate a random guess to simulate opponent
      const selectionIndex = index;
      debug('mock opponent schedule', { selectionIndex });
      mockOppTimeoutRef.current = setTimeout(() => {
        // avoid affecting a new question after index changes
        debug('mock opponent fire', { nowIndex: index, selectionIndex, roundResolved: roundResolvedRef.current });
        if (index !== selectionIndex) return;
        if (roundResolvedRef.current) return;
        const opts = current.options;
        const randomGuess = opts[Math.floor(Math.random() * opts.length)];
        opponentSelectIndexRef.current = opponentSelectIndexRef.current ?? selectionIndex;
        setOpponentGuess(prev => prev ?? randomGuess);
      }, 600);
      // Result is computed in effect when both selections are present
    }
  };

  const advanceToNext = () => {
    debug('advanceToNext called', { index, advancing: advancingRef.current });
    if (advancingRef.current) return;
    advancingRef.current = true;
    if (advanceTimeoutRef.current) {
      debug('advanceToNext clearing existing advanceTimeout');
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    if (index < items.length - 1) {
      debug('advanceToNext → setIndex(+1)');
      setIndex((i) => i + 1);
    } else {
      debug('advanceToNext → showFinal');
      setShowFinal(true);
    }
  };

  const scheduleAdvance = (delayMs: number) => {
    if (scheduledOnceRef.current) {
      debug('scheduleAdvance skip (already scheduled)', { index, delayMs, scheduledIndex: scheduledIndexRef.current });
      return;
    }
    scheduledOnceRef.current = true;
    const lockIndex = index;
    scheduledIndexRef.current = lockIndex;
    debug('scheduleAdvance', { lockIndex, delayMs });
    advanceTimeoutRef.current = setTimeout(() => {
      debug('advanceTimeout fire', { currentIndex: index, lockIndex, scheduledIndex: scheduledIndexRef.current });
      if (scheduledIndexRef.current !== lockIndex) return;
      if (index !== lockIndex) return;
      advanceToNext();
    }, delayMs);
  };

  // When both players have selected in multiplayer, compute outcome and advance
  useEffect(() => {
    if (mode !== 'multi') return;
    if (!selected || !opponentGuess) return;
    if (roundResolvedRef.current) return;
    if (selfSelectIndexRef.current !== indexRef.current || opponentSelectIndexRef.current !== indexRef.current) {
      debug('skip outcome: index mismatch', { index: indexRef.current, selfIdx: selfSelectIndexRef.current, oppIdx: opponentSelectIndexRef.current });
      return;
    }
    debug('compute outcome', { index, selected, opponentGuess, city: current.city });
    const selfCorrect = selected === current.city;
    const oppCorrect = opponentGuess === current.city;
    let outcome: 'win' | 'lose' | 'draw' = 'draw';
    if (selfCorrect && !oppCorrect) outcome = 'win';
    else if (!selfCorrect && oppCorrect) outcome = 'lose';
    setRoundOutcome(outcome);
    // record guesses for side panels (once per question)
    setSelfGuesses((arr) => (arr.some((g) => g.idx === index) ? arr : [...arr, { idx: index, guess: selected, correct: selfCorrect }]));
    setOpponentGuesses((arr) => (arr.some((g) => g.idx === index) ? arr : [...arr, { idx: index, guess: opponentGuess, correct: oppCorrect }]));
    // Update personal stats for final summary
    if (selfCorrect) {
      setScore((s) => s + 1);
      setCorrectCount((c) => c + 1);
    } else {
      setWrongCount((c) => c + 1);
    }
    setLastResult(selfCorrect ? 'correct' : 'wrong');
    setShowResult(true);
    roundResolvedRef.current = true;
    scheduleAdvance(1500);
  }, [mode, selected, opponentGuess, current.city, index, items.length]);

  const handleNext = () => {
    if (mode === 'multi') {
      advanceToNext();
      return;
    }
    if (index < items.length - 1) {
      setIndex((i) => i + 1);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] text-[#f6f7fb]">
      {/* News Preview */}
      {gameStarted && showNewsPreview && (
        <div className="fixed inset-0 z-50 bg-[#1a2234] animate-fade-in">
          <div className="container mx-auto px-6 py-8 max-w-4xl h-full flex flex-col">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-100"
                  style={{ width: `${previewProgress}%` }}
                />
              </div>
              <div className="text-center text-white/60 text-sm mt-2">
                {Math.ceil((100 - previewProgress) / 20)} saniye
              </div>
            </div>

            {/* News Content */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {/* Image */}
                {current.imageUrl && (
                  <div className="w-full h-64 md:h-96 overflow-hidden">
                    <img
                      src={current.imageUrl}
                      alt={current.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Text Content */}
                <div className="p-8">
                  <div className="text-sm text-white/50 mb-3">
                    Soru {index + 1} / {items.length}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {current.title}
                  </h2>
                  <p className="text-xl text-white/80 leading-relaxed">
                    {current.summary}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-3 py-2 rounded-lg border border-white/10 text-white/80 hover:text-white hover:bg-white/5 transition"
              aria-label={t('actions.back', { default: 'Geri' })}
            >
              ← {t('actions.back', { default: 'Geri' })}
            </button>
            <h1 className="text-3xl font-bold">{t('title', { default: 'NewsGuessr' })}</h1>
          </div>
          {gameStarted && <div className="text-[#8fb8ff]">{t('score', { score, total: items.length })}</div>}
        </div>

        {gameStarted && !showNewsPreview && (
          <div className="bg-[#1a2234] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-in-top">
            <div className="p-6 relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Self guesses panel */}
                <aside className="lg:col-span-3 order-2 lg:order-1 lg:hidden">
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-blue-950/40 to-blue-900/20 hover:from-blue-900/50 hover:to-blue-800/30 transition">
                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                      <div className="text-blue-300 font-semibold">{t('yourGuess', { default: 'Senin Tahminlerin' })}</div>
                      <div className="text-xs text-white/70">
                        <span className="text-green-400 font-semibold">{selfGuesses.filter(g => g.correct).length}</span>
                        <span className="text-white/50"> / </span>
                        <span className="text-red-400 font-semibold">{selfGuesses.filter(g => !g.correct).length}</span>
                      </div>
                    </div>
                    <div className="px-4 py-3 text-xs text-white/60">@Sen</div>
                    <ul className="max-h-64 overflow-auto p-3 space-y-2">
                      {selfGuesses.length === 0 && (
                        <li className="text-white/50 text-sm">{t('noGuesses', { default: 'Henüz tahmin yok.' })}</li>
                      )}
                      {selfGuesses.map((g) => (
                        <li
                          key={`self-${g.idx}`}
                          className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:shadow-lg hover:-translate-y-0.5 ${g.correct ? 'bg-green-900/20 hover:bg-green-900/30' : 'bg-red-900/20 hover:bg-red-900/30'}`}
                          title={`Soru ${g.idx + 1}`}
                        >
                          <span className="text-white/80">Soru {g.idx + 1}</span>
                          <span className={`ml-3 font-semibold ${g.correct ? 'text-green-400' : 'text-red-400'}`}>{g.guess}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>

                {/* Center: Map */}
                <div className="lg:col-span-12 order-1 lg:order-2 lg:mx-20">
                  <TurkeyMap
                    selected={selected}
                    correct={showResult ? current.city : null}
                    disabled={!!selected}
                    onSelect={(province) => handleSelect(province)}
                  />
                  {mode === 'multi' && (selected || opponentGuess) && (
                    <div className="mt-4 text-sm text-white/80">
                      <div className="flex items-center gap-4">
                        <span>{t('yourGuess', { default: 'Senin tahminin' })}: <strong>{selected ?? '-'}</strong></span>
                        <span>{t('opponentGuess', { default: 'Rakibin tahmini' })}: <strong>{opponentGuess ?? '-'}</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Opponent guesses panel */}
                <aside className="lg:col-span-3 order-3 lg:hidden">
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-purple-950/40 to-purple-900/20 hover:from-purple-900/50 hover:to-purple-800/30 transition">
                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                      <div className="text-purple-300 font-semibold">{t('opponentGuess', { default: 'Rakibin Tahminleri' })}</div>
                      <div className="text-xs text-white/70">
                        <span className="text-green-400 font-semibold">{opponentGuesses.filter(g => g.correct).length}</span>
                        <span className="text-white/50"> / </span>
                        <span className="text-red-400 font-semibold">{opponentGuesses.filter(g => !g.correct).length}</span>
                      </div>
                    </div>
                    <div className="px-4 py-3 text-xs text-white/60">@Rakip</div>
                    <ul className="max-h-64 overflow-auto p-3 space-y-2">
                      {opponentGuesses.length === 0 && (
                        <li className="text-white/50 text-sm">{t('noGuesses', { default: 'Henüz tahmin yok.' })}</li>
                      )}
                      {opponentGuesses.map((g) => (
                        <li
                          key={`opp-${g.idx}`}
                          className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:shadow-lg hover:-translate-y-0.5 ${g.correct ? 'bg-green-900/20 hover:bg-green-900/30' : 'bg-red-900/20 hover:bg-red-900/30'}`}
                          title={`Soru ${g.idx + 1}`}
                        >
                          <span className="text-white/80">Soru {g.idx + 1}</span>
                          <span className={`ml-3 font-semibold ${g.correct ? 'text-green-400' : 'text-red-400'}`}>{g.guess}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </div>
            </div>
            {/* Edge-fixed side panels for large screens */}
            <div className="hidden lg:block">
              {/* Left fixed: Self */}
              <div className="fixed left-4 top-1/2 -translate-y-1/2 z-30 w-64">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-blue-950/40 to-blue-900/20 hover:from-blue-900/50 hover:to-blue-800/30 transition shadow-xl">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="text-blue-300 font-semibold">{t('yourGuess', { default: 'Senin Tahminlerin' })}</div>
                    <div className="text-xs text-white/70">
                      <span className="text-green-400 font-semibold">{selfGuesses.filter(g => g.correct).length}</span>
                      <span className="text-white/50"> / </span>
                      <span className="text-red-400 font-semibold">{selfGuesses.filter(g => !g.correct).length}</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 text-xs text-white/60">@Sen</div>
                  <ul className="max-h-[40vh] overflow-auto p-3 space-y-2">
                    {selfGuesses.length === 0 && (
                      <li className="text-white/50 text-sm">{t('noGuesses', { default: 'Henüz tahmin yok.' })}</li>
                    )}
                    {selfGuesses.map((g) => (
                      <li key={`self-fixed-${g.idx}`} className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:shadow-lg hover:-translate-y-0.5 ${g.correct ? 'bg-green-900/20 hover:bg-green-900/30' : 'bg-red-900/20 hover:bg-red-900/30'}`} title={`Soru ${g.idx + 1}`}>
                        <span className="text-white/80">Soru {g.idx + 1}</span>
                        <span className={`ml-3 font-semibold ${g.correct ? 'text-green-400' : 'text-red-400'}`}>{g.guess}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Right fixed: Opponent */}
              <div className="fixed right-4 top-1/2 -translate-y-1/2 z-30 w-64">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-purple-950/40 to-purple-900/20 hover:from-purple-900/50 hover:to-purple-800/30 transition shadow-xl">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="text-purple-300 font-semibold">{t('opponentGuess', { default: 'Rakibin Tahminleri' })}</div>
                    <div className="text-xs text-white/70">
                      <span className="text-green-400 font-semibold">{opponentGuesses.filter(g => g.correct).length}</span>
                      <span className="text-white/50"> / </span>
                      <span className="text-red-400 font-semibold">{opponentGuesses.filter(g => !g.correct).length}</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 text-xs text-white/60">@Rakip</div>
                  <ul className="max-h-[40vh] overflow-auto p-3 space-y-2">
                    {opponentGuesses.length === 0 && (
                      <li className="text-white/50 text-sm">{t('noGuesses', { default: 'Henüz tahmin yok.' })}</li>
                    )}
                    {opponentGuesses.map((g) => (
                      <li key={`opp-fixed-${g.idx}`} className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:shadow-lg hover:-translate-y-0.5 ${g.correct ? 'bg-green-900/20 hover:bg-green-900/30' : 'bg-red-900/20 hover:bg-red-900/30'}`} title={`Soru ${g.idx + 1}`}>
                        <span className="text-white/80">Soru {g.idx + 1}</span>
                        <span className={`ml-3 font-semibold ${g.correct ? 'text-green-400' : 'text-red-400'}`}>{g.guess}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {/* footer removed: auto-advance enabled */}
          </div>
        )}

        {/* Oyun Giriş Ekranı */}
        {!gameStarted && (
          <div className="bg-gradient-to-br from-[#1a2234] via-[#1e2a3f] to-[#1a2234] border border-white/20 rounded-3xl shadow-2xl shadow-blue-900/20 overflow-hidden animate-fade-in backdrop-blur-sm">
            <div className="p-10 md:p-12 text-center">
              {/* Icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50 animate-pulse ring-4 ring-blue-400/30 ring-offset-4 ring-offset-[#1a2234]">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Başlık */}
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4 drop-shadow-lg">
                NewsGuessr
              </h2>
              <p className="text-2xl text-white/90 mb-8 drop-shadow-md">
                Haberlerden Şehir Tahmin Et!
              </p>

              {/* Oyun Açıklaması */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 mb-8 text-left shadow-xl hover:shadow-2xl hover:border-white/30 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl"></div>
                <div className="relative">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Nasıl Oynanır?
                  </h3>
                  <div className="space-y-3 text-white/70">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5 shadow-lg shadow-blue-500/30">1</div>
                      <p>Her soru için 5 saniye haber önizlemesi gösterilir</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5 shadow-lg shadow-blue-500/30">2</div>
                      <p>Haberin hangi şehirde geçtiğini tahmin et</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5 shadow-lg shadow-blue-500/30">3</div>
                      <p>Doğru cevap için 10 XP kazan</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5 shadow-lg shadow-blue-500/30">4</div>
                      <p>6 soru ile oyunu tamamla</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Özellikler */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="relative group bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-5 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20 hover:border-green-400/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/40 group-hover:shadow-xl group-hover:shadow-green-500/60 transition-all duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-white mb-2 text-lg">Doğru Cevap</h4>
                    <p className="text-white/70 text-sm">+10 XP kazan</p>
                  </div>
                </div>
                <div className="relative group bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-5 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/20 hover:border-yellow-400/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/40 group-hover:shadow-xl group-hover:shadow-yellow-500/60 transition-all duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-white mb-2 text-lg">5 Saniye</h4>
                    <p className="text-white/70 text-sm">Haber önizlemesi</p>
                  </div>
                </div>
                <div className="relative group bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-5 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 hover:border-purple-400/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/40 group-hover:shadow-xl group-hover:shadow-purple-500/60 transition-all duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-white mb-2 text-lg">Çok Oyunculu</h4>
                    <p className="text-white/70 text-sm">Arkadaşlarınla yarış</p>
                  </div>
                </div>
              </div>

              {/* Başla Butonu */}
              <button
                onClick={() => setGameStarted(true)}
                className="relative group px-10 py-5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white font-bold text-2xl rounded-2xl shadow-2xl shadow-blue-500/40 transition-all hover:scale-105 hover:shadow-blue-500/60 flex items-center gap-4 mx-auto animate-pulse border border-blue-400/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <span className="relative flex items-center gap-4">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-8V6a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
                  </svg>
                  Oyunu Başlat
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Manual next fallback after results in multiplayer */}
        {mode === 'multi' && showResult && !showFinal && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-lg border border-white/10 hover:bg-white/5"
            >
              {t('actions.next', { default: 'Sonraki' })}
            </button>
          </div>
        )}
      </div>

      {/* Result Modal */}
      {showResult && lastResult && mode !== 'none' && !showFinal && (
        <ResultModal
          mode={mode}
          lastResult={lastResult}
          roundOutcome={roundOutcome}
          correctCount={correctCount}
          wrongCount={wrongCount}
          totalQuestions={items.length}
          correctCity={current.city}
          onClose={() => {
            advanceToNext();
          }}
        />
      )}

      {/* Final Results Modal */}
      {showFinal && (
        <FinalResultsModal
          correctCount={correctCount}
          wrongCount={wrongCount}
          totalQuestions={items.length}
          onClose={() => router.back()}
          onReplay={() => {
            // Tüm state'leri sıfırla
            setIndex(0);
            setScore(0);
            setCorrectCount(0);
            setWrongCount(0);
            setShowFinal(false);
            setSelfGuesses([]);
            setOpponentGuesses([]);
            setSelected(null);
            setShowResult(false);
            setLastResult(null);
            setOpponentGuess(null);
            setRoundOutcome(null);
            setGameStarted(false);
          }}
        />
      )}

      {/* Mode selector overlay */}
      {gameStarted && mode === 'none' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1a2234] border border-white/10 rounded-2xl p-8 w-[90%] max-w-md text-center">
            <h3 className="text-2xl font-semibold mb-2">{t('selectMode.title', { default: 'Oyun Modu Seç' })}</h3>
            <p className="text-white/70 mb-6">{t('selectMode.subtitle', { default: 'Tek oyunculu veya çok oyunculu oynayın.' })}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setMode('single')}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                {t('selectMode.single', { default: 'Tek Oyunculu' })}
              </button>
              <button
                onClick={() => {
                  // Create or use existing room id in URL
                  const existing = searchParams.get('room');
                  const id = existing || Math.random().toString(36).slice(2, 8);
                  setRoomId(id);
                  setMode('multi');
                  const qp = new URLSearchParams(Array.from(searchParams.entries()));
                  qp.set('room', id);
                  router.replace(`?${qp.toString()}`);
                }}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
              >
                {t('selectMode.multi', { default: 'Çok Oyunculu' })}
              </button>
              {roomId && (
                <div className="text-white/60 text-sm mt-2">
                  {t('selectMode.shareRoom', { default: 'Odaya katılmak için bu linki paylaş:' })}
                  <div className="mt-1 break-all text-white">{typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?room=${roomId}` : ''}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



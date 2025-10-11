'use client';

import { useMemo, useState, type JSX } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { useGamification } from '@/contexts/gamification-context';
import { RANK_THRESHOLDS, UserRank } from '@/lib/types/gamification';

import { GameCard } from './_components/game-card';
import type { Game } from './_types/game-types';

// Icon Components
const GamepadIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3-1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0z"/>
  </svg>
);

const BookIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
  </svg>
);

const BrainIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
);

const AlphabetIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const LightningIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
  </svg>
);

const CalendarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
  </svg>
);

const SearchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const TargetIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const PuzzleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/>
  </svg>
);

const MapIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
  </svg>
);

const DocumentIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
  </svg>
);

const BirdIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V7.5L21 9ZM3 9L9 7.5V5.5L3 7V9ZM12 8C9.8 8 8 9.8 8 12S9.8 16 12 16 16 14.2 16 12 14.2 8 12 8ZM12 14C10.9 14 10 13.1 10 12S10.9 10 12 10 14 10.9 14 12 13.1 14 12 14Z"/>
  </svg>
);

// XP Progress Bar Component
const XPProgressBar = ({ currentXP, currentRank }: { currentXP: number; currentRank: UserRank }) => {
  const getCurrentLevelInfo = () => {
    const ranks = Object.values(UserRank);
    const currentIndex = ranks.indexOf(currentRank);
    const currentThreshold = RANK_THRESHOLDS[currentRank];
    const nextRank = ranks[currentIndex + 1];
    const nextThreshold = nextRank ? RANK_THRESHOLDS[nextRank] : currentThreshold;
    
    const progress = nextRank 
      ? ((currentXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100
      : 100;
    
    const xpToNext = nextRank ? nextThreshold - currentXP : 0;
    
    return {
      currentRank,
      nextRank,
      currentThreshold,
      nextThreshold,
      progress: Math.min(Math.max(progress, 0), 100),
      xpToNext,
      isMaxLevel: !nextRank
    };
  };

  const levelInfo = getCurrentLevelInfo();
  
  const getRankDisplayName = (rank: UserRank) => {
    const rankNames = {
      [UserRank.NEW_MEMBER]: 'Yeni Üye',
      [UserRank.ACTIVE_READER]: 'Aktif Okuyucu',
      [UserRank.KNOWLEDGE_SHARER]: 'Bilgi Paylaşımcısı',
      [UserRank.EXPERT_COMMENTER]: 'Uzman Yorumcu',
      [UserRank.COMMUNITY_LEADER]: 'Topluluk Lideri'
    };
    return rankNames[rank];
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">
              {getRankDisplayName(levelInfo.currentRank)}
            </h3>
            <p className="text-white/60 text-xs">
              {currentXP.toLocaleString('en-US')} XP
            </p>
          </div>
        </div>
        
        {!levelInfo.isMaxLevel && (
          <div className="text-right">
            <p className="text-white/60 text-xs">
              Sonraki seviye
            </p>
            <p className="text-white font-semibold text-sm">
              {getRankDisplayName(levelInfo.nextRank!)}
            </p>
          </div>
        )}
      </div>

      {!levelInfo.isMaxLevel ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/60">
              {levelInfo.currentThreshold.toLocaleString('en-US')} XP
            </span>
            <span className="text-white/60">
              {levelInfo.nextThreshold!.toLocaleString('en-US')} XP
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center mt-1">
              <span className="text-white/60 text-xs">
                %{Math.round(levelInfo.progress)} tamamlandı
              </span>
              <span className="text-yellow-400 text-xs font-medium">
                {levelInfo.xpToNext.toLocaleString()} XP kaldı
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-2">
          <p className="text-yellow-400 font-semibold text-sm">
            🎉 Maksimum seviyeye ulaştınız!
          </p>
        </div>
      )}
    </div>
  );
};

type BaseGame = Omit<Game, 'title' | 'description' | 'estimatedTime'> & {
  readonly translationKey: string;
};

const baseGames: readonly BaseGame[] = [
  {
    id: 'quizzes',
    translationKey: 'quizzes',
    icon: <BrainIcon className="w-6 h-6" />,
    color: 'blue',
    category: 'educational',
    difficulty: 'easy',
    xpReward: 30,
    isAvailable: true,
    isCompleted: false,
    completionRate: 0,
  },
  {
    id: 'memory-game',
    translationKey: 'memoryGame',
    icon: <PuzzleIcon className="w-6 h-6" />,
    color: 'purple',
    category: 'memory',
    difficulty: 'medium',
    xpReward: 25,
    isAvailable: true,
    isCompleted: false,
    completionRate: 0,
  },
  {
    id: 'word-puzzle',
    translationKey: 'wordPuzzle',
    icon: <AlphabetIcon className="w-6 h-6" />,
    color: 'green',
    category: 'word',
    difficulty: 'medium',
    xpReward: 20,
    isAvailable: true,
    isCompleted: false,
    completionRate: 0,
  },
  {
    id: 'news-trivia',
    translationKey: 'newsTrivia',
    icon: <LightningIcon className="w-6 h-6" />,
    color: 'yellow',
    category: 'trivia',
    difficulty: 'easy',
    xpReward: 15,
    isAvailable: true,
    isCompleted: false,
    completionRate: 0,
  },
  {
    id: 'news-guessr',
    translationKey: 'newsGuessr',
    icon: <MapIcon className="w-6 h-6" />,
    color: 'cyan',
    category: 'trivia',
    difficulty: 'medium',
    xpReward: 30,
    isAvailable: true,
    isCompleted: false,
    completionRate: 0,
  },
  {
    id: 'wordle',
    translationKey: 'wordle',
    icon: <DocumentIcon className="w-6 h-6" />,
    color: 'green',
    category: 'word',
    difficulty: 'medium',
    xpReward: 35,
    isAvailable: true,
    isCompleted: false,
    completionRate: 0,
  },
  {
    id: 'flappy-aa-bird',
    translationKey: 'flappyAABird',
    icon: <BirdIcon className="w-6 h-6" />,
    color: 'orange',
    category: 'arcade',
    difficulty: 'medium',
    xpReward: 20,
    isAvailable: true,
    isCompleted: false,
    completionRate: 0,
  },
];

// Coming Soon Games - These will only appear in the Coming Soon section
const comingSoonGamesData: readonly BaseGame[] = [
  {
    id: 'timeline-game',
    translationKey: 'timelineGame',
    icon: <CalendarIcon className="w-6 h-6" />,
    color: 'cyan',
    category: 'timeline',
    difficulty: 'hard',
    xpReward: 40,
    isAvailable: false,
    isCompleted: false,
    completionRate: 0,
  },
  {
    id: 'spot-the-difference',
    translationKey: 'spotTheDifference',
    icon: <SearchIcon className="w-6 h-6" />,
    color: 'red',
    category: 'visual',
    difficulty: 'medium',
    xpReward: 30,
    isAvailable: false,
    isCompleted: false,
    completionRate: 0,
  },
];

const baseCategories: readonly { readonly id: string; readonly icon: JSX.Element }[] = [
  { id: 'all', icon: <GamepadIcon className="w-5 h-5" /> },
  { id: 'educational', icon: <BookIcon className="w-5 h-5" /> },
  { id: 'memory', icon: <BrainIcon className="w-5 h-5" /> },
  { id: 'word', icon: <AlphabetIcon className="w-5 h-5" /> },
  { id: 'trivia', icon: <LightningIcon className="w-5 h-5" /> },
  { id: 'timeline', icon: <CalendarIcon className="w-5 h-5" /> },
  { id: 'visual', icon: <SearchIcon className="w-5 h-5" /> },
  { id: 'arcade', icon: <TargetIcon className="w-5 h-5" /> },
];

export default function GamesPage(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { userProfile } = useGamification();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('games');

  const categories = useMemo(
    () =>
      baseCategories.map((category) => ({
        ...category,
        name: t(`categories.${category.id}.name`),
      })),
    [t],
  );

  const games = useMemo(
    () =>
      baseGames.map((game) => ({
        ...game,
        title: t(`gamesList.${game.translationKey}.title`),
        description: t(`gamesList.${game.translationKey}.description`),
        estimatedTime: t(`gamesList.${game.translationKey}.estimatedTime`),
      })),
    [t],
  );

  const filteredGames = selectedCategory === 'all'
    ? games
    : games.filter((game) => game.category === selectedCategory);

  const comingSoonGames = useMemo(
    () => comingSoonGamesData.map((game) => ({
      ...game,
      title: t(`gamesList.${game.translationKey}.title`),
      description: t(`gamesList.${game.translationKey}.description`),
      estimatedTime: t(`gamesList.${game.translationKey}.estimatedTime`),
    })),
    [t],
  );

  const handleGameSelect = (game: Game) => {
    if (!game.isAvailable) {
      return;
    }

    if (game.id === 'quizzes') {
      router.push(`/${locale}/quizzes`);
    } else if (game.id === 'wordle') {
      router.push(`/${locale}/games/wordle`);
    } else if (game.id === 'flappy-aa-bird') {
      router.push(`/${locale}/games/flappy-aa-bird`);
    } else if (game.id === 'memory-game') {
      router.push(`/${locale}/games/memory-game`);
    } else if (game.id === 'word-puzzle') {
      router.push(`/${locale}/games/word-puzzle`);
    } else {
      router.push(`/${locale}/games/${game.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] text-[#f6f7fb] relative overflow-hidden">
      {/* Özel CSS Animasyonları */}
      <style jsx>{`
        @keyframes floatBounce {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
          75% { transform: translateY(-15px) rotate(2deg); }
        }
        
        @keyframes floatBounce2 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-25px) rotate(-5deg) scale(1.1); }
          50% { transform: translateY(-15px) rotate(3deg) scale(0.9); }
          75% { transform: translateY(-20px) rotate(-2deg) scale(1.05); }
        }
        
        @keyframes floatBounce3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-18px) rotate(4deg); }
          66% { transform: translateY(-8px) rotate(-2deg); }
        }
        
        .aa-logo-1 { animation: floatBounce 4s ease-in-out infinite; }
        .aa-logo-2 { animation: floatBounce2 5s ease-in-out infinite; }
        .aa-logo-3 { animation: floatBounce3 3.5s ease-in-out infinite; }
        .aa-logo-4 { animation: floatBounce 4.5s ease-in-out infinite; }
        .aa-logo-5 { animation: floatBounce2 3.8s ease-in-out infinite; }
        .aa-logo-6 { animation: floatBounce3 4.2s ease-in-out infinite; }
        .aa-logo-7 { animation: floatBounce 3.2s ease-in-out infinite; }
        .aa-logo-8 { animation: floatBounce2 4.8s ease-in-out infinite; }
      `}</style>
      
      {/* Zıplayan AA Logoları */}
      <div className="absolute inset-0 pointer-events-none">
        {/* AA Logo 1 - Kırmızı */}
        <div className="absolute top-20 left-10 aa-logo-1">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500/30 to-red-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-red-500/25 p-2">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 2 - Mavi */}
        <div className="absolute top-40 right-20 aa-logo-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-blue-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-blue-500/25 p-2">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 3 - Yeşil */}
        <div className="absolute top-60 left-1/4 aa-logo-3">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500/30 to-green-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-green-500/25 p-2">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 4 - Sarı */}
        <div className="absolute top-80 right-1/3 aa-logo-4">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/30 to-yellow-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-yellow-500/25 p-1">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 5 - Mor */}
        <div className="absolute top-32 left-2/3 aa-logo-5">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-purple-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-purple-500/25 p-2">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 6 - Cyan */}
        <div className="absolute top-72 right-10 aa-logo-6">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/30 to-cyan-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-cyan-500/25 p-2">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 7 - Pembe */}
        <div className="absolute top-96 left-1/2 aa-logo-7">
          <div className="w-11 h-11 bg-gradient-to-br from-pink-500/30 to-pink-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-pink-500/25 p-1">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 8 - Turuncu */}
        <div className="absolute top-48 right-1/4 aa-logo-8">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500/30 to-orange-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-orange-500/25 p-2">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 9 - İndigo */}
        <div className="absolute top-1/2 left-16 aa-logo-1">
          <div className="w-13 h-13 bg-gradient-to-br from-indigo-500/30 to-indigo-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-indigo-500/25 p-2">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 10 - Teal */}
        <div className="absolute top-1/2 right-16 aa-logo-2">
          <div className="w-15 h-15 bg-gradient-to-br from-teal-500/30 to-teal-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-teal-500/25 p-2">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 11 - Emerald */}
        <div className="absolute bottom-32 left-1/3 aa-logo-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/30 to-emerald-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-emerald-500/25 p-2">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 12 - Rose */}
        <div className="absolute bottom-40 right-1/3 aa-logo-4">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-500/30 to-rose-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-rose-500/25 p-2">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 13 - Violet */}
        <div className="absolute bottom-20 left-1/2 aa-logo-5">
          <div className="w-11 h-11 bg-gradient-to-br from-violet-500/30 to-violet-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-violet-500/25 p-1">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 14 - Sky */}
        <div className="absolute bottom-60 right-1/2 aa-logo-6">
          <div className="w-14 h-14 bg-gradient-to-br from-sky-500/30 to-sky-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-sky-500/25 p-2">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 15 - Lime */}
        <div className="absolute top-1/3 left-4 aa-logo-7">
          <div className="w-10 h-10 bg-gradient-to-br from-lime-500/30 to-lime-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-lime-500/25 p-1">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 16 - Amber */}
        <div className="absolute top-2/3 right-4 aa-logo-8">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500/30 to-amber-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-amber-500/25 p-2">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 17 - Fuchsia */}
        <div className="absolute top-1/4 left-1/2 aa-logo-1">
          <div className="w-13 h-13 bg-gradient-to-br from-fuchsia-500/30 to-fuchsia-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-fuchsia-500/25 p-2">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 18 - Emerald */}
        <div className="absolute top-3/4 right-1/2 aa-logo-2">
          <div className="w-15 h-15 bg-gradient-to-br from-emerald-500/30 to-emerald-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-emerald-500/25 p-2">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 19 - Slate */}
        <div className="absolute bottom-16 left-1/4 aa-logo-3">
          <div className="w-11 h-11 bg-gradient-to-br from-slate-500/30 to-slate-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-slate-500/25 p-1">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* AA Logo 20 - Stone */}
        <div className="absolute bottom-24 right-1/4 aa-logo-4">
          <div className="w-12 h-12 bg-gradient-to-br from-stone-500/30 to-stone-600/40 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-stone-500/25 p-2">
            <img src="/AA_amblem_renkli.png" alt="AA" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10">
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

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{t('page.title')}</h1>
          <p className="text-[#8fb8ff] text-lg mb-4">
            Eğlenceli oyunlarla bilginizi test edin ve XP kazanın!
          </p>
          {userProfile && (
            <XPProgressBar 
              currentXP={userProfile.xp} 
              currentRank={userProfile.currentRank} 
            />
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">{t('page.categoriesHeading')}</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onSelect={() => handleGameSelect(game)}
            />
          ))}
        </div>

        {comingSoonGames.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">{t('page.comingSoonHeading')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoonGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onSelect={() => handleGameSelect(game)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

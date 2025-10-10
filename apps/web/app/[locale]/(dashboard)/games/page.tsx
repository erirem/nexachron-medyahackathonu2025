'use client';

import { useMemo, useState, type JSX } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { useGamification } from '@/contexts/gamification-context';

import { GameCard } from './_components/game-card';
import type { Game } from './_types/game-types';

type BaseGame = Omit<Game, 'title' | 'description' | 'estimatedTime'> & {
  readonly translationKey: string;
};

const baseGames: readonly BaseGame[] = [
  {
    id: 'quizzes',
    translationKey: 'quizzes',
    icon: '🧠',
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
    icon: '🧩',
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
    icon: '🔤',
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
    icon: '⚡',
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
    icon: '🗺️',
    color: 'cyan',
    category: 'trivia',
    difficulty: 'medium',
    xpReward: 30,
    isAvailable: true,
    isCompleted: false,
    completionRate: 0,
  },
  {
    id: 'timeline-game',
    translationKey: 'timelineGame',
    icon: '📅',
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
    icon: '🔍',
    color: 'red',
    category: 'visual',
    difficulty: 'medium',
    xpReward: 30,
    isAvailable: false,
    isCompleted: false,
    completionRate: 0,
  },
  {
    id: 'wordle',
    translationKey: 'wordle',
    icon: '📝',
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
    icon: '🐦',
    color: 'orange',
    category: 'arcade',
    difficulty: 'medium',
    xpReward: 20,
    isAvailable: true,
    isCompleted: false,
    completionRate: 0,
  },
];

const baseCategories: readonly { readonly id: string; readonly icon: string }[] = [
  { id: 'all', icon: '🎮' },
  { id: 'educational', icon: '📚' },
  { id: 'memory', icon: '🧠' },
  { id: 'word', icon: '🔤' },
  { id: 'trivia', icon: '⚡' },
  { id: 'timeline', icon: '📅' },
  { id: 'visual', icon: '🔍' },
  { id: 'arcade', icon: '🎯' },
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
    () => games.filter((game) => !game.isAvailable),
    [games],
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
          <h1 className="text-4xl font-bold mb-2">{t('page.title')}</h1>
          <p className="text-[#8fb8ff] text-lg">
            {t('page.description', { xp: (userProfile?.xp ?? 0).toLocaleString(locale) })}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">{t('page.categoriesHeading')}</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
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

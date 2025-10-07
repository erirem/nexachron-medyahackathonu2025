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
    } else {
      router.push(`/${locale}/games/${game.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] text-[#f6f7fb]">
      <div className="container mx-auto px-6 py-8">
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

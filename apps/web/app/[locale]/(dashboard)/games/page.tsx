'use client';

import { useState, type JSX } from 'react';
import { useRouter } from 'next/navigation';
import { useGamification } from '@/contexts/gamification-context';
import { GameCard } from './_components/game-card';
import type { Game } from './_types/game-types';

// Mock oyun data
const mockGames: Game[] = [
  {
    id: 'quizzes',
    title: 'Quizler',
    description: 'Bilginizi test edin ve XP kazanın! Haber, genel kültür, spor ve daha fazlası.',
    icon: '🧠',
    color: 'blue',
    category: 'educational',
    difficulty: 'easy',
    xpReward: 30,
    isAvailable: true,
    isCompleted: false,
    completionRate: 0,
    estimatedTime: '5-15 dk'
  },
  {
    id: 'memory-game',
    title: 'Haber Hafıza Oyunu',
    description: 'Haber başlıklarını eşleştirin ve hafızanızı güçlendirin.',
    icon: '🧩',
    color: 'purple',
    category: 'memory',
    difficulty: 'medium',
    xpReward: 25,
    isAvailable: true,
    isCompleted: false,
    completionRate: 0,
    estimatedTime: '3-8 dk'
  },
  {
    id: 'word-puzzle',
    title: 'Kelime Bulmaca',
    description: 'Haberlerden kelimeleri bulun ve kelime dağarcığınızı genişletin.',
    icon: '🔤',
    color: 'green',
    category: 'word',
    difficulty: 'medium',
    xpReward: 20,
    isAvailable: true,
    isCompleted: false,
    completionRate: 0,
    estimatedTime: '4-10 dk'
  },
  {
    id: 'news-trivia',
    title: 'Haber Trivia',
    description: 'Güncel haberler hakkında hızlı sorular ve cevaplar.',
    icon: '⚡',
    color: 'yellow',
    category: 'trivia',
    difficulty: 'easy',
    xpReward: 15,
    isAvailable: true,
    isCompleted: false,
    completionRate: 0,
    estimatedTime: '2-5 dk'
  },
  {
    id: 'timeline-game',
    title: 'Zaman Çizelgesi',
    description: 'Olayları kronolojik sıraya koyun ve tarih bilginizi test edin.',
    icon: '📅',
    color: 'cyan',
    category: 'timeline',
    difficulty: 'hard',
    xpReward: 40,
    isAvailable: false, // Henüz geliştirilmedi
    isCompleted: false,
    completionRate: 0,
    estimatedTime: '8-15 dk'
  },
  {
    id: 'spot-the-difference',
    title: 'Farkı Bul',
    description: 'Haber fotoğraflarında farkları bulun ve dikkat becerinizi geliştirin.',
    icon: '🔍',
    color: 'red',
    category: 'visual',
    difficulty: 'medium',
    xpReward: 30,
    isAvailable: false, // Henüz geliştirilmedi
    isCompleted: false,
    completionRate: 0,
    estimatedTime: '5-12 dk'
  },
  {
    id: 'wordle',
    title: 'Wordle',
    description: '5 harfli kelimeyi 6 denemede bulun! Her gün yeni bir kelime.',
    icon: '📝',
    color: 'green',
    category: 'word',
    difficulty: 'medium',
    xpReward: 35,
    isAvailable: true,
    isCompleted: false,
    completionRate: 0,
    estimatedTime: '3-8 dk'
  }
];

const gameCategories = [
  { id: 'all', name: 'Tümü', icon: '🎮' },
  { id: 'educational', name: 'Eğitici', icon: '📚' },
  { id: 'memory', name: 'Hafıza', icon: '🧠' },
  { id: 'word', name: 'Kelime', icon: '🔤' },
  { id: 'trivia', name: 'Trivia', icon: '⚡' },
  { id: 'timeline', name: 'Zaman Çizelgesi', icon: '📅' },
  { id: 'visual', name: 'Görsel', icon: '🔍' }
];

export default function GamesPage(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { userProfile } = useGamification();
  const router = useRouter();

  const filteredGames = selectedCategory === 'all' 
    ? mockGames 
    : mockGames.filter(game => game.category === selectedCategory);

  const handleGameSelect = (game: Game) => {
    if (!game.isAvailable) {
      return; // Henüz geliştirilmemiş oyunlar için hiçbir şey yapma
    }

    if (game.id === 'quizzes') {
      // Quizler için özel sayfaya yönlendir
      router.push('/quizzes');
    } else if (game.id === 'wordle') {
      // Wordle için özel sayfaya yönlendir
      router.push('/games/wordle');
    } else {
      // Diğer oyunlar için oyun sayfasına yönlendir
      router.push(`/games/${game.id}`);
    }
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Oyunlar</h1>
          <p className="text-[#8fb8ff] text-lg">
            Eğlenceli oyunlarla bilginizi test edin ve XP kazanın! {userProfile?.xp || 0} XP'niz var.
          </p>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Kategoriler</h2>
          <div className="flex flex-wrap gap-3">
            {gameCategories.map((category) => (
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

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onSelect={() => handleGameSelect(game)}
            />
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Yakında Gelecek</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockGames
              .filter(game => !game.isAvailable)
              .map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onSelect={() => handleGameSelect(game)}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

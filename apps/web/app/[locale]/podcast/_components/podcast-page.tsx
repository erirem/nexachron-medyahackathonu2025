'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PodcastCard } from './podcast-card';
import { PodcastPlayer } from './podcast-player';
import { Sidebar } from '../../(dashboard)/dashboard/_components/dashboard';

interface Podcast {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  duration: string;
  category: string;
  isPlaying?: boolean;
}

const featuredPodcasts: Podcast[] = [
  {
    id: '1',
    title: 'Güncel Haberler',
    subtitle: 'Son dakika gelişmeleri ve önemli haberler',
    imageUrl: 'https://picsum.photos/300/300?random=1',
    duration: '15 dk',
    category: 'Gündem',
  },
  {
    id: '2',
    title: 'Spor Haberleri',
    subtitle: 'Futbol, basketbol ve diğer spor dalları',
    imageUrl: 'https://picsum.photos/300/300?random=2',
    duration: '12 dk',
    category: 'Spor',
  },
  {
    id: '3',
    title: 'Teknoloji Dünyası',
    subtitle: 'Yapay zeka, yazılım ve teknoloji trendleri',
    imageUrl: 'https://picsum.photos/300/300?random=3',
    duration: '18 dk',
    category: 'Teknoloji',
  },
  {
    id: '4',
    title: 'Ekonomi Bülteni',
    subtitle: 'Piyasa analizi ve ekonomik gelişmeler',
    imageUrl: 'https://picsum.photos/300/300?random=4',
    duration: '20 dk',
    category: 'Ekonomi',
  },
  {
    id: '5',
    title: 'Dünya Haberleri',
    subtitle: 'Uluslararası gelişmeler ve diplomasi',
    imageUrl: 'https://picsum.photos/300/300?random=5',
    duration: '14 dk',
    category: 'Dünya',
  },
];

const trendingPodcasts: Podcast[] = [
  {
    id: '6',
    title: 'HOT HITS HABERLER',
    subtitle: 'Bugünün en çok dinlenen haber podcastleri',
    imageUrl: 'https://picsum.photos/300/300?random=6',
    duration: '16 dk',
    category: 'Trend',
  },
  {
    id: '7',
    title: 'TÜRKÇE HABERLER',
    subtitle: 'Türkiye\'den en güncel haberler',
    imageUrl: 'https://picsum.photos/300/300?random=7',
    duration: '13 dk',
    category: 'Yerel',
  },
  {
    id: '8',
    title: 'BREAKING NEWS',
    subtitle: 'Son dakika haberleri ve acil durumlar',
    imageUrl: 'https://picsum.photos/300/300?random=8',
    duration: '10 dk',
    category: 'Acil',
  },
  {
    id: '9',
    title: '100+ DİNLEME',
    subtitle: 'En çok dinlenen haber podcastleri',
    imageUrl: 'https://picsum.photos/300/300?random=9',
    duration: '22 dk',
    category: 'Popüler',
  },
];

const categories = [
  { name: 'Gündem', color: 'from-blue-500 to-blue-600', icon: '📈' },
  { name: 'Spor', color: 'from-green-500 to-green-600', icon: '⚽' },
  { name: 'Teknoloji', color: 'from-purple-500 to-purple-600', icon: '💻' },
  { name: 'Ekonomi', color: 'from-orange-500 to-orange-600', icon: '📊' },
  { name: 'Dünya', color: 'from-red-500 to-red-600', icon: '🌍' },
  { name: 'Kültür', color: 'from-pink-500 to-pink-600', icon: '🎭' },
];

export function PodcastPage() {
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();

  const handlePodcastSelect = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setIsPlaying(true);
  };

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === 'audio') return; // Stay on podcast page
    
    if (categoryId === 'profile' || categoryId === 'leaderboard' || categoryId === 'quizzes' || categoryId === 'games') {
      const destination = categoryId === 'quizzes' ? 'quizzes' : categoryId;
      router.push(`/tr/${destination}`);
      return;
    }

    if (categoryId === 'reels') {
      router.push('/tr/explore');
      return;
    }

    router.push('/tr/dashboard');
  };

  const topics = [
    { id: 't1', title: 'Gündem', change: '+Yeni', sentiment: 'neutral' as const, description: 'Bugünün önemli başlıkları', icon: '' },
    { id: 't2', title: 'Spor', change: '+Trend', sentiment: 'positive' as const, description: 'Saha ve skorlar', icon: '' },
    { id: 't3', title: 'Teknoloji', change: '⚡', sentiment: 'positive' as const, description: 'Yenilikler', icon: '' },
  ];

  return (
    <div className="relative flex min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] text-[#f6f7fb]">
      <Sidebar
        width={300}
        onWidthChange={() => {}}
        minWidth={300}
        maxWidth={300}
        isCollapsed={false}
        activeCategory="audio"
        onCategoryChange={handleCategoryChange}
        topics={topics}
      />

      <main
        className="relative z-10 flex-1 overflow-hidden transition-all duration-200"
        style={{ marginLeft: '300px' }}
      >
        <div className="flex min-h-screen flex-col">
          <div className="relative flex-1 overflow-y-auto">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#20324a_0%,rgba(25,37,58,0.94)_60%,#141b29_100%)]" aria-hidden />
            <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,#365982_0%,rgba(20,28,45,0.82)_70%,transparent_95%)] blur-[80px] opacity-80" aria-hidden />

            <div className="relative z-10 flex flex-col gap-10 px-6 pb-16 pt-10 sm:px-8 lg:px-12">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#0f6acd] to-[#1a8dff]">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">PODCAST</p>
                    <h1 className="text-2xl font-bold text-white">Haber Podcastleri</h1>
                  </div>
                </div>
                <button className="rounded-full bg-white/10 p-3 backdrop-blur-sm hover:bg-white/20 transition-colors">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>

              {/* Featured Podcasts */}
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Öne Çıkan Podcastler</h2>
                  <button className="text-sm text-blue-300 hover:text-blue-200 transition-colors">
                    Tümünü göster
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {featuredPodcasts.map((podcast) => (
                    <PodcastCard
                      key={podcast.id}
                      podcast={podcast}
                      onSelect={() => handlePodcastSelect(podcast)}
                    />
                  ))}
                </div>
              </section>

              {/* Trending Podcasts */}
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Trend Podcastler</h2>
                  <button className="text-sm text-blue-300 hover:text-blue-200 transition-colors">
                    Tümünü göster
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {trendingPodcasts.map((podcast) => (
                    <PodcastCard
                      key={podcast.id}
                      podcast={podcast}
                      onSelect={() => handlePodcastSelect(podcast)}
                    />
                  ))}
                </div>
              </section>

              {/* Categories */}
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Kategoriler</h2>
                  <button className="text-sm text-blue-300 hover:text-blue-200 transition-colors">
                    Tümünü göster
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.color} p-6 text-center transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                    >
                      <div className="text-3xl mb-2">{category.icon}</div>
                      <div className="text-sm font-semibold text-white">{category.name}</div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Podcast Player Modal */}
      {selectedPodcast && (
        <PodcastPlayer
          podcast={selectedPodcast}
          isPlaying={isPlaying}
          onClose={() => setSelectedPodcast(null)}
          onPlayPause={() => setIsPlaying(!isPlaying)}
        />
      )}
    </div>
  );
}

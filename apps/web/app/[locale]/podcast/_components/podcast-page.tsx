'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PodcastCard } from './podcast-card';
import { PodcastPlayer } from './podcast-player';
import { Sidebar } from '../../(dashboard)/dashboard/_components/dashboard';
import { useNews } from '../../../../hooks/use-news';
import { useTTS } from '../../../../hooks/use-tts';

interface Podcast {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  duration: string;
  category: string;
  isPlaying?: boolean;
  audioUrl?: string;
}

// Helper function to convert news to podcast format
const convertNewsToPodcast = (newsItem: any): Podcast => {
  // Generate duration based on content length (rough estimate)
  const contentLength = newsItem.summary?.length || 0;
  const estimatedDuration = Math.max(5, Math.min(30, Math.ceil(contentLength / 100))); // 5-30 minutes
  
  return {
    id: newsItem.id,
    title: newsItem.title,
    subtitle: newsItem.summary || 'Haber detayları',
    imageUrl: newsItem.image_url || 'https://picsum.photos/300/300?random=' + newsItem.id,
    duration: `${estimatedDuration} dk`,
    category: newsItem.category || 'Gündem',
  };
};

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
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch news data
  const { data: newsData, isLoading: isNewsLoading } = useNews({ limit: 30 });
  
  // TTS hook
  const { generateAudio, isLoading: isTTSLoading } = useTTS();

  // Convert news to podcast format
  const featuredPodcasts = useMemo(() => {
    if (!newsData) return [];
    return newsData.slice(0, 5).map(convertNewsToPodcast);
  }, [newsData]);

  const trendingPodcasts = useMemo(() => {
    if (!newsData) return [];
    // Use news items 5-13 for trending (skip first 5 which are featured)
    return newsData.slice(5, 13).map(convertNewsToPodcast);
  }, [newsData]);

  const handlePodcastSelect = async (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setAudioError(null);
    setIsGeneratingAudio(true);
    
    try {
      // Generate TTS audio for the news
      const ttsResponse = await generateAudio({
        newsId: podcast.id,
        contentType: 'summary', // Use summary for podcast
        voice: 'alloy',
        speed: 1.0,
      });
      
      // Update podcast with audio URL
      const podcastWithAudio = {
        ...podcast,
        audioUrl: ttsResponse.audioUrl,
      };
      
      setSelectedPodcast(podcastWithAudio);
      setIsPlaying(true);
    } catch (error) {
      console.error('TTS generation failed:', error);
      setAudioError('Ses oluşturulamadı. Lütfen tekrar deneyin.');
      // Still show the player but without audio
      setSelectedPodcast(podcast);
    } finally {
      setIsGeneratingAudio(false);
    }
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

              {/* Loading State */}
              {isNewsLoading && (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              )}

              {/* Featured Podcasts */}
              {!isNewsLoading && (
                <section>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Öne Çıkan Podcastler</h2>
                    <button className="text-sm text-blue-300 hover:text-blue-200 transition-colors">
                      Tümünü göster
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {featuredPodcasts.map((podcast) => (
                      <PodcastCard
                        key={podcast.id}
                        podcast={podcast}
                        onSelect={() => handlePodcastSelect(podcast)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Trending Podcasts */}
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Trend Podcastler</h2>
                  <button className="text-sm text-blue-300 hover:text-blue-200 transition-colors">
                    Tümünü göster
                  </button>
                </div>
                
                {/* Debug info - remove in production */}
                <div className="mb-4 text-xs text-gray-400">
                  Debug: Loading: {isNewsLoading ? 'Yes' : 'No'}, Count: {trendingPodcasts.length}, Data: {newsData?.length || 0}
                </div>
                
                {isNewsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-400">Trend podcast'ler yükleniyor...</span>
                  </div>
                ) : trendingPodcasts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {trendingPodcasts.map((podcast) => (
                      <PodcastCard
                        key={podcast.id}
                        podcast={podcast}
                        onSelect={() => handlePodcastSelect(podcast)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>Trend podcast bulunamadı</p>
                    <p className="text-sm mt-2">Popüler haberler yüklenirken bir sorun olabilir</p>
                  </div>
                )}
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
          isPlaying={isPlaying && !isGeneratingAudio}
          onClose={() => {
            setSelectedPodcast(null);
            setIsPlaying(false);
            setAudioError(null);
          }}
          onPlayPause={() => setIsPlaying(!isPlaying)}
        />
      )}
      
      {/* Loading Overlay for TTS Generation */}
      {isGeneratingAudio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="rounded-2xl bg-gradient-to-br from-[#1a2234] to-[#0f1624] p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-white text-lg">Ses oluşturuluyor...</p>
              <p className="text-white/70 text-sm">Bu işlem birkaç saniye sürebilir</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useCallback, useEffect, useMemo, type JSX } from "react";
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthState } from '@/contexts/auth-context';

import { DashboardNewsGrid } from "./dashboard-news-grid";
import { NewsCard } from "./news-card";
import { MiniProfileWidget } from "@/components/user-profile/mini-profile-widget";
import { LiveTrackingModal } from '@/components/live-tracking/live-tracking-modal';
import type { DashboardNewsItem, DashboardTopic } from "./types";
import { useCategories } from "@/hooks/use-categories";
import { usePopularNews } from "@/hooks/use-popular-news";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useInfiniteNews } from "@/hooks/use-infinite-news";
import { useNewsTracking } from "@/contexts/news-tracking-context";
import { TriviaPopup } from "@/components/trivia-popup";
import { WelcomeScreen } from "@/components/welcome-screen";
import { StreakPopup } from "@/components/streak-popup";
import { postRecommendations } from "@/services/api";
import { LogoutButton } from "@/components/auth/logout-button";

import type {
  CategoriesOverviewResponse,
  NewsCategorySummary,
  NewsListDataPayload,
  NewsWithMediaDto,
  TrendingNewsDataPayload,
} from "@nexachron/shared-types";

type DashboardProps = {
  readonly initialNews: NewsListDataPayload;
  readonly topics: readonly DashboardTopic[];
  readonly categoriesOverview?: CategoriesOverviewResponse;
  readonly initialPopularNews?: TrendingNewsDataPayload;
};

// Icon mapping for categories
const getCategoryIcon = (categoryId: string): JSX.Element => {
  const iconMap: Record<string, JSX.Element> = {
    'gundem': <AgendaIcon />,
    'finans': <FinanceIcon />,
    'savunma': <DefenseIcon />,
    'enerji': <EnergyIcon />,
    'teknoloji': <TechIcon />,
    'spor': <SportsIcon />,
    'saglik': <HealthIcon />,
    'ekonomi': <EconomyIcon />,
    'diplomasi': <AgendaIcon />,
    'cevre': <EnergyIcon />,
    'turizm': <SportsIcon />,
    'tarim': <HealthIcon />,
  };

  return iconMap[categoryId.toLowerCase()] || <AllIcon />;
};

type SideRailItem = {
  readonly id: string;
  readonly label: string;
  readonly icon: JSX.Element;
};

const sideRailItems: readonly SideRailItem[] = [
  { id: "overview", label: "Genel Akış", icon: <HomeIcon /> },
  { id: "saved", label: "Kaydedilenler", icon: <BookmarkFillIcon /> },
  { id: "watch", label: "Takip", icon: <BellIcon /> },
  { id: "games", label: "Oyunlar", icon: <GamepadIcon /> },
  { id: "analyst", label: "Kişisel Analist", icon: <AnalystIcon /> },
  { id: "profile", label: "Profilim", icon: <UserIcon /> },
  { id: "leaderboard", label: "Liderlik", icon: <TrophyIcon /> },
  { id: "reels", label: "Explore", icon: <PlayIcon /> },
  { id: "audio", label: "Sesler", icon: <HeadphoneIcon /> },
  { id: "reports", label: "Raporlar", icon: <DocumentIcon /> },
  { id: "briefs", label: "Günlük", icon: <LightningIcon /> },
];

const topicPalette: Record<DashboardTopic["sentiment"], { readonly bubble: string; readonly badge: string; readonly accent: string }> = {
  positive: {
    bubble: "bg-gradient-to-br from-[#1f3d2b] to-[#28563a]",
    badge: "bg-[#1f3d2b] text-[#9ee8c0] border border-[#2a5f3e]",
    accent: "bg-[#42b574]",
  },
  neutral: {
    bubble: "bg-gradient-to-br from-[#1f2f4a] to-[#243a60]",
    badge: "bg-[#1f2f4a] text-[#8fb8ff] border border-[#2a4371]",
    accent: "bg-[#3f7dd5]",
  },
  negative: {
    bubble: "bg-gradient-to-br from-[#3b1d24] to-[#5a2834]",
    badge: "bg-[#3b1d24] text-[#feb7c6] border border-[#642d3c]",
    accent: "bg-[#d43c5b]",
  },
};

export function Dashboard({ initialNews, topics, categoriesOverview, initialPopularNews }: DashboardProps): JSX.Element {
  const router = useRouter();
  const { profile, user, loading } = useAuthState();
  const [sidebarWidth, setSidebarWidth] = useState(80);
  const [activeCategory, setActiveCategory] = useState('forYou');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showTriviaPopup, setShowTriviaPopup] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [showLiveTrackingModal, setShowLiveTrackingModal] = useState(false);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chipsScrollRef = useRef<HTMLDivElement>(null);
  const MIN_WIDTH = 80;
  const MAX_WIDTH = 450;
  const COLLAPSED_THRESHOLD = 160;

  const isCollapsed = sidebarWidth <= COLLAPSED_THRESHOLD;
  const limit = (initialNews.pagination?.pageSize ?? initialNews.items.length) || 10;

  const {
    news: apiNewsItems,
    loadMore,
    isLoading: isNewsLoading,
    isFetching: isNewsFetching,
    isFetchingNextPage,
    hasNextPage,
    isError: isNewsError,
    error: newsError,
  } = useInfiniteNews({
    categoryId: selectedCategoryIds.length === 1 ? selectedCategoryIds[0] : undefined,
    categoryIds: selectedCategoryIds.length > 1 ? selectedCategoryIds : undefined,
    filterCategory: selectedCategoryIds.length === 0 ? activeCategory : undefined,
  });

  const { shouldShowTriviaPopup, getReadPercentage } = useNewsTracking();

  // Check if trivia popup should be shown
  useEffect(() => {
    const totalNewsCount = apiNewsItems.length;
    if (totalNewsCount > 0 && shouldShowTriviaPopup(totalNewsCount)) {
      setShowTriviaPopup(true);
    }
  }, [apiNewsItems.length, shouldShowTriviaPopup]);

  // Show welcome screen on first visit
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('nexachron_welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcomeScreen(true);
      localStorage.setItem('nexachron_welcome_seen', 'true');
    } else {
      // If user has seen welcome before, show streak popup directly
      showStreakPopupIfNeeded();
    }
  }, []);

  // Show streak popup when welcome screen closes (for first-time users)
  useEffect(() => {
    if (!showWelcomeScreen) {
      showStreakPopupIfNeeded();
    }
  }, [showWelcomeScreen]);

  // Function to show streak popup if needed
  const showStreakPopupIfNeeded = useCallback(() => {
    const lastStreakPopup = localStorage.getItem('nexachron_streak_popup_last_shown');
    const today = new Date().toDateString();
    
    console.log('[Streak Popup] Checking streak popup:', {
      lastStreakPopup,
      today,
      shouldShow: lastStreakPopup !== today
    });
    
    if (lastStreakPopup !== today) {
      const timer = setTimeout(() => {
        console.log('[Streak Popup] Showing streak popup');
        setShowStreakPopup(true);
        localStorage.setItem('nexachron_streak_popup_last_shown', today);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Infinite scroll effect
  const isNextPageLoadingRef = useRef(false);

  // Preserve scroll position when new items are loaded
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isNextPageLoadingRef.current) {
          isNextPageLoadingRef.current = true;
          setIsLoadingMore(true);

          if (typeof loadMore !== 'function') {
            setIsLoadingMore(false);
            isNextPageLoadingRef.current = false;
            return;
          }

          Promise.resolve(loadMore()).finally(() => {
            setIsLoadingMore(false);
            isNextPageLoadingRef.current = false;
          });
        }
      },
      { threshold: 0.1, rootMargin: '100px' } // Trigger when 100px before the element
    );

    if (loadMoreTriggerRef.current) {
      observer.observe(loadMoreTriggerRef.current);
    }

    return () => {
      if (loadMoreTriggerRef.current) {
        observer.unobserve(loadMoreTriggerRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, loadMore]);

  const {
    categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories({
    initialOverview: categoriesOverview,
  });

  const {
    data: popularNewsItems,
    isLoading: isPopularNewsLoading,
    isFetching: isPopularNewsFetching,
    error: popularNewsError,
    refetch: refetchPopularNews,
  } = usePopularNews({
    limit: 5,
    initialData: initialPopularNews,
  });

  const mappedNews = useMemo(
    () => apiNewsItems.map(transformNewsItem),
    [apiNewsItems],
  );

  // Recommendations state with lazy loading
  const [recs, setRecs] = useState<any[]>([]);
  const [recLimit, setRecLimit] = useState(8);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  useEffect(() => {
    let mounted = true;
    setIsLoadingRecs(true);
    postRecommendations(recLimit)
      .then((res) => {
        if (!mounted) return;
        if (res?.ok && Array.isArray(res.items)) {
          setRecs(res.items);
        }
      })
      .finally(() => {
        if (mounted) setIsLoadingRecs(false);
      });
    return () => { mounted = false; };
  }, [recLimit]);

  // Bookmarks
  const { bookmarkedIds, isLoading: isBookmarksLoading } = useBookmarks();

  // Filter news by selected categories - API'den gelen veriler zaten filtrelenmiş
  const filteredNews = useMemo(() => {
    // API'den gelen veriler zaten seçili kategorilere göre filtrelenmiş
    // Sadece client-side filtreleme gereken durumlar için ek filtreleme yap
    if (selectedCategoryIds.length === 0) {
      if (activeCategory === 'saved') {
        return mappedNews.filter((n) => bookmarkedIds.has(n.id));
      }
      if (activeCategory === 'breaking') {
        // breaking = güncelden geriye doğru; mappedNews zaten order bilgisi yakın
        return [...mappedNews].sort((a, b) => {
          const da = new Date(a.createdAt ?? a.publishedAt ?? Date.now()).getTime();
          const db = new Date(b.createdAt ?? b.publishedAt ?? Date.now()).getTime();
          return db - da;
        });
      }
      // Apply local, semantic filters for tabs like audio/reports/briefs/watch/overview
      return applyLocalFilters(mappedNews, activeCategory);
    }

    // API'den gelen veriler zaten filtrelenmiş, direkt kullan
    return mappedNews;
  }, [mappedNews, selectedCategoryIds, activeCategory, bookmarkedIds]);

  const categoryInfo = useMemo(() => {
    if (selectedCategoryIds.length > 0) {
      if (selectedCategoryIds.length === 1) {
        const selected = categories?.find((category: any) => category.id === selectedCategoryIds[0]);
        const label = selected?.label ?? deriveCategoryLabel(selectedCategoryIds[0]);
        return {
          title: label,
          subtitle: 'Seçili kategori için son haberler',
        };
      } else {
        return {
          title: 'Seçili Kategoriler',
          subtitle: `${selectedCategoryIds.length} kategori için son haberler`,
        };
      }
    }

    switch (activeCategory) {
      case 'saved':
        return {
          title: 'Kaydedilen Haberler',
          subtitle: 'Favorilerinize eklediğiniz haberler',
        };
      case 'audio':
        return {
          title: 'Sesli İçerikler',
          subtitle: 'Podcast ve sesli haber içerikleri',
        };
      case 'reports':
        return {
          title: 'Raporlar ve Analizler',
          subtitle: 'Derinlemesine analiz ve raporlar',
        };
      case 'briefs':
        return {
          title: 'Günlük Özetler',
          subtitle: 'Günün önemli gelişmeleri',
        };
      case 'watch':
        return {
          title: 'Takip Edilen Konular',
          subtitle: 'Seçili başlıklar için canlı güncellemeler',
        };
      default:
        return {
          title: 'Günün Öne Çıkan Haberleri',
          subtitle: 'Anadolu Ajansı\'ndan son gelişmeler',
        };
    }
  }, [activeCategory, selectedCategoryIds, categories]);

  const locale = useLocale();

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      if (
        categoryId === 'profile' ||
        categoryId === 'leaderboard' ||
        categoryId === 'quizzes' ||
        categoryId === 'games' ||
        categoryId === 'analyst'
      ) {
        const destination = categoryId === 'quizzes' ? 'quizzes' : categoryId;
        router.push(`/${locale}/${destination}`);
        return;
      }

      // Explore (reels) ayrı bir sayfaya gider
      if (categoryId === 'reels') {
        router.push(`/${locale}/explore`);
        return;
      }

      // Audio (podcast) ayrı bir sayfaya gider
      if (categoryId === 'audio') {
        router.push(`/${locale}/podcast`);
        return;
      }

      setActiveCategory(categoryId);
      if (categoryId !== 'overview') {
        setSelectedCategoryIds([]);
      }
    },
    [router, locale],
  );

  const handleCategoryChipSelect = useCallback((categoryId: string) => {
    setSelectedCategoryIds((previous) => {
      if (previous.includes(categoryId)) {
        return previous.filter(id => id !== categoryId);
      } else {
        return [...previous, categoryId];
      }
    });
    setActiveCategory('overview');
  }, []);

  const hasNews = filteredNews.length > 0;

  // Get filtered news based on current state
  const getFilteredNews = useCallback(() => {
    if (selectedCategoryIds.length > 0) {
      return filteredNews;
    }
    return applyLocalFilters(mappedNews, activeCategory);
  }, [filteredNews, selectedCategoryIds, mappedNews, activeCategory]);

  // Get category info based on current state
  const getCategoryInfo = useCallback(() => {
    return categoryInfo;
  }, [categoryInfo]);

  // Scroll to top functionality
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Show/hide scroll to top button based on scroll position & lazy load for 'forYou'
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      console.log('Scroll position:', scrollTop, 'showScrollToTop:', scrollTop > 50);
      setShowScrollToTop(scrollTop > 50);
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Intersection observer for recommendations lazy load
  useEffect(() => {
    if (activeCategory !== 'forYou') return;
    const el = loadMoreTriggerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoadingRecs) {
        setRecLimit((prev) => Math.min(prev + 8, 64));
      }
    }, { threshold: 0.1, rootMargin: '120px' });

    observer.observe(el);
    return () => observer.disconnect();
  }, [activeCategory, isLoadingRecs]);

  return (
    <div className="relative flex min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] text-[#f6f7fb]">
      <BackdropDecor />

      <Sidebar
        width={sidebarWidth}
        onWidthChange={setSidebarWidth}
        minWidth={MIN_WIDTH}
        maxWidth={MAX_WIDTH}
        isCollapsed={isCollapsed}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        topics={topics}
      />

      <main
        className="relative z-10 flex-1 overflow-hidden transition-all duration-200"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <div className="flex min-h-screen flex-col">
          <div ref={scrollContainerRef} className="relative flex-1 overflow-y-auto">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#20324a_0%,rgba(25,37,58,0.94)_60%,#141b29_100%)]" aria-hidden />
            <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,#365982_0%,rgba(20,28,45,0.82)_70%,transparent_95%)] blur-[80px] opacity-80" aria-hidden />

            <div className="relative z-10 flex flex-col gap-8 px-6 pb-16 pt-6 sm:px-8 lg:px-12">
              <MobileLibrary topics={topics} />
              <DashboardHeader onOpenLiveTracking={() => setShowLiveTrackingModal(true)} />

              <section className="space-y-6">
                {/* For You as main grid reusing news layout below */}
                <div className="flex flex-col gap-2">
                  {/* Mobilde header altı arama */}
                  <div className="md:hidden">
                    <SearchBox />
                  </div>
                  <div className="relative -mx-2">
                    {/* left arrow */}
                    <button
                      type="button"
                      onClick={() => {
                        const el = chipsScrollRef.current; if (!el) return; el.scrollBy({ left: -240, behavior: 'smooth' });
                      }}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white shadow backdrop-blur-sm hover:bg-white/20"
                      aria-label="Sola kaydır"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    {/* scrollable chips */}
                    <div ref={chipsScrollRef} className="flex items-center gap-2 overflow-x-auto scrollbar-hidden px-10 py-1 whitespace-nowrap">

                    {/* Sizin için */}
                    <FilterChip
                      label="Sizin için"
                      icon={<AllIcon />}
                      active={activeCategory === 'forYou'}
                      count={recs.length > 0 ? recs.length : undefined}
                      onClick={() => {
                        setSelectedCategoryIds([]);
                        handleCategoryChange('forYou');
                        if (recs.length === 0) {
                          postRecommendations(8).then((res) => {
                            if (res?.ok && Array.isArray(res.items)) setRecs(res.items);
                          }).catch(() => {});
                        }
                      }}
                    />

                    {/* Son Dakika */}
                    <FilterChip
                      label="Son Dakika"
                      icon={<LightningIcon />}
                      active={activeCategory === 'breaking'}
                      onClick={() => {
                        setSelectedCategoryIds([]);
                        handleCategoryChange('breaking');
                      }}
                    />

                    {/* API'den gelen kategoriler */}
                    {categories?.slice(0, 8).map((category: any) => (
                      <FilterChip
                        key={category.id}
                        label={category.label}
                        icon={getCategoryIcon(category.id)}
                        count={category.total}
                        active={selectedCategoryIds.includes(category.id)}
                        onClick={() => handleCategoryChipSelect(category.id)}
                      />
                    ))}
                    </div>
                    {/* right arrow */}
                    <button
                      type="button"
                      onClick={() => {
                        const el = chipsScrollRef.current; if (!el) return; el.scrollBy({ left: 240, behavior: 'smooth' });
                      }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white shadow backdrop-blur-sm hover:bg-white/20"
                      aria-label="Sağa kaydır"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                  {isNewsFetching && (
                    <span className="text-xs font-semibold text-white/60">Güncelleniyor...</span>
                  )}
                </div>



                <div className="mb-8 space-y-4">
                  {selectedCategoryIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedCategoryIds.map((categoryId) => {
                        const category = categories?.find(c => c.id === categoryId);
                        const label = category?.label ?? deriveCategoryLabel(categoryId);
                        return (
                          <ActiveCategoryBadge
                            key={categoryId}
                            label={label}
                            onClear={() => setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId))}
                          />
                        );
                      })}
                      {selectedCategoryIds.length > 1 && (
                        <button
                          onClick={() => setSelectedCategoryIds([])}
                          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/20"
                        >
                          Tümünü Temizle
                        </button>
                      )}
                    </div>
                  )}

                  {isNewsError ? (
                    <ErrorState
                      message="Haber akışı yüklenirken bir sorun oluştu."
                      onRetry={() => {
                        // Reload the page to reset the infinite query
                        window.location.reload();
                      }}
                    />
                  ) : isNewsLoading && apiNewsItems.length === 0 ? (
                    <NewsGridSkeleton />
                  ) : activeCategory === 'saved' && !isBookmarksLoading && filteredNews.length === 0 ? (
                    <EmptyState
                      message="Henüz kaydedilmiş haberin yok. Kartlardaki Kaydet butonuna tıklayarak ekleyebilirsin."
                    />
                  ) : apiNewsItems.length > 0 ? (
                    <>
                      {activeCategory === 'forYou' ? (
                        <div className="space-y-4">
                          {/* Öneri kartları */}
                          <DashboardNewsGrid
                            key={`recs-${recs.length}`}
                            items={recs.map((n: any) => ({
                              id: n.id,
                              category: n.category ?? 'Gündem',
                              categoryId: n.category ?? 'gundem',
                              title: n.title,
                              summary: (n.content ?? '').slice(0, 160),
                              detail: (n.content ?? '').slice(0, 160),
                              fullContent: n.content ?? '',
                              timestamp: new Date(n.created_at ?? Date.now()).toLocaleDateString('tr-TR'),
                              publishedAt: n.created_at ?? new Date().toISOString(),
                              storyDate: n.created_at ?? new Date().toISOString(),
                              readingTime: '2 dk okuma',
                              dateline: 'Türkiye',
                              tags: [n.category?.toLowerCase() ?? 'gundem'],
                              imageUrl: n.image_url || 'https://images.unsplash.com/photo-1521133573890-3b093187b0e7?auto=format&fit=crop&w=960&q=60',
                              images: [],
                              sentiment: 'positive' as const,
                              impact: 'Yüksek' as const,
                              viewCount: undefined,
                              likeCount: undefined,
                              shareCount: undefined,
                              relatedIds: undefined,
                              storyId: undefined,
                              timelineOrder: undefined,
                              storyTitle: undefined,
                              author: undefined,
                              isPopular: true,
                              city: null,
                              createdAt: n.created_at,
                              subtitle: undefined,
                              isRecommended: true, // Öneri kartı işareti
                            }))}
                            title=""
                            subtitle=""
                            showAll={true}
                          />
                          
                          {/* Lazy trigger */}
                          <div ref={loadMoreTriggerRef} className="h-16" />
                        </div>
                      ) : (
                        <DashboardNewsGrid
                          key={apiNewsItems.length}
                          items={filteredNews}
                          title={categoryInfo.title}
                          subtitle={categoryInfo.subtitle}
                          showAll={true}
                        />
                      )}
                      {(isFetchingNextPage || isLoadingMore) && (
                        <NewsLoadingPlaceholders />
                      )}
                      {/* Load more trigger */}
                      {hasNextPage && (
                        <div
                          ref={loadMoreTriggerRef}
                          className="h-20 flex items-center justify-center"
                        >
                          {!(isFetchingNextPage || isLoadingMore) && (
                            <div className="text-white/40 text-sm">Daha fazla haber için kaydırın</div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <EmptyState
                      message="Bu kriterlere uygun haber bulunamadı."
                      onReset={() => setSelectedCategoryIds([])}
                    />
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollToTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="fixed bottom-8 right-4 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#0f6acd] to-[#1a8dff] text-white shadow-[0_12px_32px_rgba(15,106,205,0.5)] transition-all duration-200 hover:scale-105 hover:shadow-[0_16px_40px_rgba(15,106,205,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
            aria-label="Başa dön"
            title="Başa dön"
          >
            <div className="text-2xl font-bold">↑</div>
          </button>
        )}
      </main>

      {/* Welcome Screen */}
      <WelcomeScreen
        isVisible={showWelcomeScreen}
        onClose={() => setShowWelcomeScreen(false)}
      />

      {/* Trivia Popup */}
      <TriviaPopup
        isVisible={showTriviaPopup}
        onClose={() => setShowTriviaPopup(false)}
        readPercentage={getReadPercentage(apiNewsItems.length)}
        totalNewsCount={apiNewsItems.length}
      />

      {/* Streak Popup */}
      <StreakPopup
        isVisible={showStreakPopup}
        onClose={() => setShowStreakPopup(false)}
      />

      {/* Live Tracking Modal */}
      <LiveTrackingModal
        isOpen={showLiveTrackingModal}
        onClose={() => setShowLiveTrackingModal(false)}
      />
    </div>
  );
}

export type SidebarProps = {
  readonly width: number;
  readonly onWidthChange: (width: number) => void;
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly isCollapsed: boolean;
  readonly activeCategory: string;
  readonly onCategoryChange: (category: string) => void;
  readonly topics: readonly DashboardTopic[];
};

export function Sidebar({ width, onWidthChange, minWidth, maxWidth, isCollapsed, activeCategory, onCategoryChange, topics }: SidebarProps): JSX.Element {
  const sidebarRef = useRef<HTMLElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const hoverTimerRef = useRef<number | null>(null);
  const hasManualResizeRef = useRef(false);
  const lastExpandedWidthRef = useRef(Math.max(320, minWidth + 40));

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    hasManualResizeRef.current = true;
  }, [width]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - startXRef.current;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));
    onWidthChange(newWidth);
    if (newWidth > minWidth + 10) {
      lastExpandedWidthRef.current = newWidth;
    }
  }, [minWidth, maxWidth, onWidthChange]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const toggleSidebar = () => {
    if (isCollapsed) {
      onWidthChange(320); // Expand to default width
    } else {
      onWidthChange(80); // Collapse to minimum width
    }
  };

  const handleMouseEnter = useCallback(() => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    // Sadece kapalıyken aç; manuel genişlik varsa onu kullan
    if (width <= minWidth + 1) {
      onWidthChange(Math.min(Math.max(lastExpandedWidthRef.current, minWidth + 40), maxWidth));
    }
  }, [onWidthChange, width, minWidth, maxWidth]);

  const handleMouseLeave = useCallback(() => {
    // Manuel olarak genişletilmişse kullanıcı tercihine saygı: kapanma yok
    if (hasManualResizeRef.current && width > minWidth + 1) {
      return;
    }
    hoverTimerRef.current = window.setTimeout(() => {
      onWidthChange(minWidth);
      hoverTimerRef.current = null;
    }, 180);
  }, [onWidthChange, width, minWidth]);

  return (
    <aside
      ref={sidebarRef}
      className="fixed left-0 top-0 z-40 h-screen overflow-hidden rounded-r-[36px] bg-gradient-to-br from-[#111f34] via-[#172d4c] to-[#0c1524] shadow-[0_32px_120px_rgba(5,16,32,0.65)] backdrop-blur-2xl transition-all duration-200 ease-out"
      style={{ width: `${width}px` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
        <div className="relative flex h-full flex-col overflow-hidden">
          <div className="absolute inset-0 bg-white/5" aria-hidden />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(58,109,177,0.35),transparent_68%)]" aria-hidden />

          <div className="relative flex h-full flex-col min-h-0">
          <div className={`flex items-center justify-between ${isCollapsed ? 'px-4 pt-6' : 'px-6 pt-7 pb-2'}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#0f6acd] to-[#1a8dff] text-sm font-semibold text-white shadow-[0_14px_40px_rgba(15,106,205,0.35)]">
                AA
              </div>
              {!isCollapsed && (
                <div>
                  <p className="text-[0.75rem] font-semibold uppercase tracking-[0.32em] text-white/55">Kütüphane</p>
                  <h2 className="text-lg font-semibold text-white">Anadolu Akışı</h2>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={() => onWidthChange(80)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-[0_10px_28px_rgba(12,36,63,0.35)] transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                  aria-label="Sidebar'ı küçült"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          </div>

          {/* Mini Profile - Below library header */}
          <div className={`${isCollapsed ? 'px-3 pt-4' : 'px-6 pt-4'}`}>
            <MiniProfileWidget isCollapsed={isCollapsed} />
          </div>

          <nav className={`mt-4 flex flex-col gap-2 ${isCollapsed ? 'px-3' : 'px-6'}`}>
            {sideRailItems.map((item) => {
              const isActive = activeCategory === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onCategoryChange(item.id)}
                  className={`group flex h-12 items-center rounded-2xl px-3 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 ${isCollapsed ? 'justify-center gap-0' : 'justify-start gap-3'
                    } ${isActive
                      ? 'bg-gradient-to-r from-[#0f6acd] to-[#1a8dff] text-white shadow-[0_12px_32px_rgba(15,106,205,0.35)]'
                      : 'bg-white/5 text-white/70 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                    }`}
                  aria-label={item.label}
                  title={isCollapsed ? item.label : undefined}
                  style={{ width: isCollapsed ? '60px' : '100%' }}
                >
                  <span className="flex h-5 w-5 items-center justify-center">
                    {item.icon}
                  </span>
                  <span
                    className={`overflow-hidden text-sm font-medium transition-all duration-200 ${isCollapsed ? 'max-w-0 opacity-0 -translate-x-2' : 'max-w-[160px] opacity-100 translate-x-0'
                      }`}
                    aria-hidden={isCollapsed}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {!isCollapsed && (
            <>
              <div className="px-6 pt-5">
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
                  <SearchIcon />
                  <input
                    placeholder="Koleksiyonlarda ara"
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/60 focus:outline-none"
                    type="search"
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
                  <button type="button" className="rounded-full bg-gradient-to-r from-[#0f6acd] to-[#1a8dff] px-3 py-1.5 text-white shadow-[0_10px_24px_rgba(15,106,205,0.3)]">Listeler</button>
                  <button type="button" className="rounded-full px-3 py-1.5 text-white/70 bg-white/5 border border-white/10 transition hover:bg-white/10 hover:text-white hover:border-white/20">Kayıtlar</button>
                  <button type="button" className="rounded-full px-3 py-1.5 text-white/70 bg-white/5 border border-white/10 transition hover:bg-white/10 hover:text-white hover:border-white/20">Sesler</button>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto px-6 pb-8 pt-4 min-h-0">
                <ul className="space-y-2">
                  {topics.map((topic) => (
                    <SidebarTopicItem key={topic.id} topic={topic} />
                  ))}
                </ul>
              </nav>
            </>
          )}

          <div className={`mt-auto ${isCollapsed ? 'px-3 pb-5' : 'px-6 pb-6'}`}>
            <div
              className={`flex ${isCollapsed ? 'flex-col items-center gap-3' : 'items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_16px_30px_rgba(8,26,47,0.35)]'}`}
            >
              {!isCollapsed && (
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-white/50">Kütüphane</p>
                  <p className="text-xs text-white/70">Yan paneli daraltmak için aşağıdaki tuşu kullan.</p>
                </div>
              )}
              <button
                type="button"
                onClick={toggleSidebar}
                className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 ${isCollapsed ? 'shadow-[0_12px_28px_rgba(11,34,63,0.4)]' : 'shadow-[0_12px_28px_rgba(11,34,63,0.3)]'
                  }`}
                aria-label={isCollapsed ? 'Kütüphaneyi genişlet' : 'Kütüphaneyi daralt'}
              >
                <span
                  className={`absolute transition-all duration-200 ${isCollapsed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-y-2'
                    }`}
                >
                  <ExpandIcon />
                </span>
                <span
                  className={`absolute transition-all duration-200 ${isCollapsed ? 'opacity-0 translate-y-2' : 'opacity-100 translate-x-0'
                    }`}
                >
                  <CloseIcon />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-blue-600 hover:bg-opacity-20 transition-colors duration-150 group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-[#d7e4f7] group-hover:bg-[#0f6acd] rounded-full transition-colors duration-150" />
        </div>
      </div>
    </aside>
  );
}

type SidebarTopicItemProps = {
  readonly topic: DashboardTopic;
};

function SidebarTopicItem({ topic }: SidebarTopicItemProps): JSX.Element {
  const palette = topicPalette[topic.sentiment];
  const highlightLabel = /[%\d]/.test(topic.change) ? null : topic.change.trim();

  return (
    <li>
      <button
        type="button"
        className="group relative flex w-full items-center gap-3.5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3.5 text-left shadow-[0_12px_32px_rgba(0,0,0,0.15)] transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_16px_40px_rgba(0,0,0,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
      >
        {highlightLabel && (
          <span className="pointer-events-none absolute -left-8 top-4 origin-left -rotate-45 bg-gradient-to-r from-[#ff6a3d] to-[#f97316] px-7 py-[0.2rem] text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_8px_18px_rgba(228,96,48,0.35)]">
            {highlightLabel}
          </span>
        )}
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white shadow-inner ${palette.bubble}`}>
          {topic.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white/90 group-hover:text-white">{topic.title}</p>
          <p className="truncate text-xs text-white/60 group-hover:text-white/80">{topic.description}</p>
        </div>
      </button>
    </li>
  );
}

type MobileLibraryProps = {
  readonly topics: readonly DashboardTopic[];
};

function MobileLibrary({ topics }: MobileLibraryProps): JSX.Element {
  return (
    <div className="-mx-6 flex overflow-x-auto pb-1.5 lg:hidden">
      <div className="flex gap-3 px-6">
        {topics.map((topic) => {
          const palette = topicPalette[topic.sentiment];

          return (
            <div
              key={topic.id}
              className="min-w-[220px] rounded-2xl border border-[#dce6f8] bg-white bg-opacity-90 px-4 py-4 shadow-[0_18px_46px_rgba(15,59,117,0.1)]"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold text-[#10233a] ${palette.bubble}`}>
                  {topic.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#0f2035]">{topic.title}</p>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[0.7rem] font-semibold ${palette.badge}`}>{topic.change}</span>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#5f7394] line-clamp-3">{topic.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardHeader({ onOpenLiveTracking }: { onOpenLiveTracking: () => void }): JSX.Element {
  const { profile, user } = useAuthState();
  const displayName =
    profile?.full_name ||
    // @ts-ignore – metadata tipleri opsiyonel olabilir
    user?.user_metadata?.first_name ||
    'Kullanıcı';
  
  return (
    <header className="flex flex-col gap-3">
      <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[auto_1fr_auto]">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.36em] text-white/60">AA panoraması</p>
          <h1 className="truncate text-[1.6rem] font-semibold leading-tight text-white">{`Hoş geldiniz, ${displayName}`}</h1>
          <p className="mt-1 max-w-xl text-[13px] text-white/70">{`Merhaba ${displayName}! Kişiselleştirilmiş haber akışınız hazır.`}</p>
        </div>

        {/* Header içi arama - geniş ekranlarda */}
        <div className="hidden md:block">
          <SearchBox />
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <LivePill onOpen={onOpenLiveTracking} />
          <LogoutButton className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60" />
          <button
            type="button"
            className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
          >
            Bildirimleri yönet
          </button>
        </div>
      </div>
    </header>
  );
}

function LivePill({ onOpen }: { onOpen: () => void }): JSX.Element {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex items-center gap-2 rounded-full bg-[#0f6acd] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(9,100,177,0.3)] transition hover:bg-[#1173cc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 cursor-pointer"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white bg-opacity-60" aria-hidden />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
      </span>
      Canlı takip
    </button>
  );
}

function SearchBox(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative flex min-w-[280px] flex-1 items-center rounded-full border transition-all duration-300 ${isFocused
      ? 'border-white/40 bg-white/15 shadow-[0_20px_60px_rgba(21,61,125,0.25)]'
      : 'border-white/20 bg-white/10 shadow-[0_18px_50px_rgba(21,61,125,0.18)]'
      }`}>
      <div className="pl-5 pr-3">
        <SearchIcon />
      </div>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Haber, şirket veya bölge ara"
        className="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-white/60 focus:outline-none"
        type="search"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
      <kbd className="hidden rounded-full border border-[#d3e1f5] bg-[#eff4fb] px-2 py-1 text-[0.65rem] font-semibold text-[#5a7397] mr-3 sm:inline-block">
        ⌘K
      </kbd>
    </div>
  );
}

type FilterChipProps = {
  readonly label: string;
  readonly icon: JSX.Element;
  readonly count?: number;
  readonly active?: boolean;
  readonly onClick?: () => void;
};

function FilterChip({ label, icon, count, active, onClick }: FilterChipProps): JSX.Element {
  if (active) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex items-center gap-2 rounded-full border border-white/30 bg-gradient-to-r from-[#0f6acd] to-[#1a8dff] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(10,94,173,0.32)] transition-all duration-200 hover:scale-105 hover:shadow-[0_20px_50px_rgba(10,94,173,0.4)]"
      >
        <span className="flex h-4 w-4 items-center justify-center">
          {icon}
        </span>
        <span>{label}</span>
        {count !== undefined && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
            {count}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/75 transition-all duration-200 hover:bg-white/20 hover:text-white hover:scale-105 hover:border-white/25"
    >
      <span className="flex h-4 w-4 items-center justify-center transition-transform duration-200 group-hover:scale-110">
        {icon}
      </span>
      <span>{label}</span>
      {count !== undefined && (
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/60 group-hover:bg-white/20 group-hover:text-white/80">
          {count}
        </span>
      )}
    </button>
  );
}

type CategorySummaryBarProps = {
  readonly categories: readonly NewsCategorySummary[] | undefined;
  readonly selectedCategoryIds: string[];
  readonly isLoading: boolean;
  readonly error: Error | undefined;
  readonly onRetry: () => Promise<unknown> | void;
  readonly onSelect: (categoryId: string) => void;
};

function CategorySummaryBar({
  categories,
  selectedCategoryIds,
  isLoading,
  error,
  onRetry,
  onSelect,
}: CategorySummaryBarProps): JSX.Element {
  if (isLoading) {
    return <CategorySummarySkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
        <span>Kategoriler yüklenemedi.</span>
        <button
          type="button"
          onClick={() => void onRetry()}
          className="rounded-full border border-red-300/40 bg-red-400/30 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-400/40"
        >
          Yeniden dene
        </button>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return <></>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {categories.slice(0, 8).map((category) => (
        <CategoryChip
          key={category.id}
          category={category}
          isActive={selectedCategoryIds.includes(category.id)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

type CategoryChipProps = {
  readonly category: NewsCategorySummary;
  readonly isActive: boolean;
  readonly onSelect: (categoryId: string) => void;
};

function CategoryChip({ category, isActive, onSelect }: CategoryChipProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${isActive
        ? 'border-white/50 bg-white/25 text-white shadow-[0_12px_28px_rgba(17,104,205,0.25)]'
        : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/12 hover:text-white'
        }`}
    >
      <span>{category.label}</span>
      <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs font-semibold text-white/80">
        {category.total}
      </span>
    </button>
  );
}

function CategorySummarySkeleton(): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-8 w-24 animate-pulse rounded-full bg-white/10" aria-hidden />
      ))}
    </div>
  );
}

type ActiveCategoryBadgeProps = {
  readonly label: string;
  readonly onClear: () => void;
};

function ActiveCategoryBadge({ label, onClear }: ActiveCategoryBadgeProps): JSX.Element {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80">
      <span className="font-semibold text-white">{label}</span>
      <button
        type="button"
        onClick={onClear}
        className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:bg-white/20 hover:text-white"
      >
        Temizle
      </button>
    </div>
  );
}

type ErrorStateProps = {
  readonly message: string;
  readonly onRetry: () => Promise<unknown> | void;
};

function ErrorState({ message, onRetry }: ErrorStateProps): JSX.Element {
  return (
    <div className="rounded-3xl border border-red-400/30 bg-red-500/10 px-6 py-12 text-center text-red-100">
      <p className="text-sm font-semibold">{message}</p>
      <button
        type="button"
        onClick={() => void onRetry()}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-300/30 bg-red-400/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400/30"
      >
        Yeniden dene
      </button>
    </div>
  );
}

type EmptyStateProps = {
  readonly message: string;
  readonly onReset?: () => void;
};

function EmptyState({ message, onReset }: EmptyStateProps): JSX.Element {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/5 px-6 py-16 text-center text-white/70">
      <p className="text-sm font-semibold">{message}</p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          Filtreyi temizle
        </button>
      )}
    </div>
  );
}

function NewsGridSkeleton(): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-72 animate-pulse rounded-[28px] border border-white/10 bg-white/5" aria-hidden />
      ))}
    </div>
  );
}

function NewsLoadingPlaceholders({ count = 4 }: { readonly count?: number }): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-live="polite">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`loading-card-${index}`}
          className="relative h-72 overflow-hidden rounded-[28px] border border-white/10 bg-white/5"
        >
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
          <div className="absolute inset-x-6 top-6 h-5 rounded-full bg-white/10" />
          <div className="absolute inset-x-6 top-16 h-40 rounded-[22px] bg-white/10" />
          <div className="absolute inset-x-6 bottom-16 h-12 rounded-2xl bg-white/10" />
          <div className="absolute inset-x-6 bottom-6 h-4 rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  );
}

const FALLBACK_IMAGE_URL =
  'https://images.unsplash.com/photo-1521133573890-3b093187b0e7?auto=format&fit=crop&w=960&q=60';

const CATEGORY_FILTERS: Record<string, (item: DashboardNewsItem) => boolean> = {
  saved: (item) => item.isPopular ?? false,
  audio: (item) => item.tags.some((tag) => tag.includes('ses')),
  reports: (item) => (item.category ?? '').includes('finans'),
  briefs: (item) => (item.category ?? '').includes('gundem'),
  watch: (item) => (item.category ?? '').includes('savunma'),
};

function applyLocalFilters(
  items: readonly DashboardNewsItem[],
  filterId: string,
): DashboardNewsItem[] {
  const predicate = CATEGORY_FILTERS[filterId];
  if (!predicate) {
    return [...items];
  }

  const filtered = items.filter(predicate);
  return filtered.length > 0 ? filtered : [...items];
}

function transformNewsItem(item: NewsWithMediaDto): DashboardNewsItem {
  const createdAt = item.createdAt ? new Date(item.createdAt) : new Date();
  const summary = item.summary && item.summary.trim().length > 0
    ? item.summary.trim()
    : truncateText(item.content, 220);
  const categoryLabel = deriveCategoryLabel(item.category);
  const readingTime = estimateReadingTime(item.content);

  // Parse media_summary if it exists and is a string
  let mediaSummary = null;
  if (item.media_summary) {
    try {
      // Check if it's already an object or a string that needs parsing
      mediaSummary = typeof item.media_summary === 'string'
        ? JSON.parse(item.media_summary)
        : item.media_summary;
    } catch (e) {
      console.error('Error parsing media_summary:', e);
      mediaSummary = null;
    }
  }

  // Extract images from media_summary if available, otherwise use other image sources
  let extractedImages = [];
  let primaryImageUrl = '';

  if (mediaSummary && mediaSummary.gallery_images && Array.isArray(mediaSummary.gallery_images)) {
    extractedImages = mediaSummary.gallery_images.map((img: { url: string; caption?: string | null }) => ({
      url: img.url,
      alt: item.title,
      caption: img.caption || undefined,
      credit: undefined,
    }));

    // Set featured image as primary if available
    if (mediaSummary.featured_image) {
      primaryImageUrl = mediaSummary.featured_image;
    } else if (extractedImages.length > 0) {
      primaryImageUrl = extractedImages[0].url;
    }
  } else {
    // Fallback to other media sources
    const orderedMedia = [...(item.media || [])].sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    extractedImages = orderedMedia.map((mediaItem) => ({
      url: mediaItem.url,
      alt: item.title,
      caption: undefined,
      credit: undefined,
    }));

    primaryImageUrl = item.primaryMedia?.url ?? extractedImages[0]?.url ?? FALLBACK_IMAGE_URL;
  }

  const tags = [categoryLabel.toLowerCase().replace(/\s+/g, '-')];

  if (item.isPopular) {
    tags.push('favori', 'trend');
  }

  return {
    id: item.id,
    category: categoryLabel,
    categoryId: item.category ?? null,
    title: item.title,
    summary,
    detail: summary,
    fullContent: item.content,
    timestamp: formatRelativeTime(createdAt),
    publishedAt: createdAt.toISOString(),
    storyDate: item.publishedAt ?? item.createdAt ?? createdAt.toISOString(),
    readingTime,
    dateline: item.city ?? 'Türkiye',
    tags,
    imageUrl: primaryImageUrl,
    images: extractedImages,
    sentiment: item.isPopular ? 'positive' : 'neutral',
    impact: item.isPopular ? 'Yüksek' : 'Orta',
    viewCount: undefined,
    likeCount: undefined,
    shareCount: undefined,
    relatedIds: undefined,
    storyId: undefined,
    timelineOrder: undefined,
    storyTitle: undefined,
    author: undefined,
    isPopular: item.isPopular,
    city: item.city ?? null,
    createdAt: item.createdAt,
    subtitle: undefined,
  };
}

function deriveCategoryLabel(categoryId: string | null | undefined): string {
  if (!categoryId) {
    return 'Gündem';
  }

  return categoryId
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ');
}

function formatRelativeTime(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat('tr', { numeric: 'auto' });
  const diffMinutes = Math.round(diffMs / 60000);

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMs / (60 * 60000));
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffMs / (24 * 60 * 60000));
  return rtf.format(diffDays, 'day');
}

function estimateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} dk okuma`;
}

function truncateText(value: string, maxLength: number): string {
  if (!value) {
    return '';
  }

  if (value.length <= maxLength) {
    return value.trim();
  }

  const shortened = value.slice(0, maxLength);
  const lastSpace = shortened.lastIndexOf(' ');
  const base = lastSpace > 0 ? shortened.slice(0, lastSpace) : shortened;
  return `${base.trim()}...`;
}

function ExpandIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M5 5l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 5L8 8l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 2v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 7H2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white/60" aria-hidden>
      <path d="M11.5 11.5L15 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="7.5" cy="7.5" r="4.8" stroke="currentColor" strokeWidth="1.6" opacity="0.75" />
    </svg>
  );
}

function BackdropDecor(): JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-[#d7e7ff] blur-[140px]" aria-hidden />
      <div className="absolute -right-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[#cfe3ff] blur-[160px]" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(circle_at_bottom,rgba(179,210,255,0.45),rgba(243,248,255,0.9))]" aria-hidden />
    </div>
  );
}

function HomeIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M4 8.8L10 3l6 5.8V17a1 1 0 01-1 1h-3v-4H8v4H5a1 1 0 01-1-1V8.8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookmarkFillIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M5 2.5h8a1 1 0 011 1v11l-5-3-5 3v-11a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M15 8a5 5 0 00-10 0c0 4-1.5 5.5-1.5 5.5h13S15 12 15 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8.5 16a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BrainIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1 .34-4.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0-.34-4.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GamepadIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M6 11h4M8 9v4M15 12h.01M17 8H3a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function HeadphoneIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M4 10a6 6 0 1112 0v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15a2 2 0 002 2h1v-6H6a2 2 0 00-2 2v2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 15a2 2 0 01-2 2h-1v-6h1a2 2 0 012 2v2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocumentIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M6 3h6l4 4v10a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LightningIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M10 1l-5 9h4l-1 9 6-10h-4l2-8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M6 4l10 6-10 6V4z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function UserIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 19a4 4 0 118 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrophyIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6M14 9h1.5a2.5 2.5 0 000-5H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 15v-1a5 5 0 00-8 0v1M14 15a2 2 0 11-4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 4v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChevronUpIcon(): JSX.Element {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// New filter icons
function AllIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function AgendaIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function FinanceIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function DefenseIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function EnergyIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function TechIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function SportsIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M8.14 12.14l1.72 1.72 4.28-4.28" />
    </svg>
  );
}

function HealthIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  );
}

function EconomyIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function AnalystIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12v4c0 .552.448 1 1 1h12c.552 0 1-.448 1-1v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

'use client';

import { useState, useRef, useCallback, useEffect, type JSX } from "react";
import { useRouter } from 'next/navigation';

import { DashboardNewsGrid } from "./dashboard-news-grid";
import { MiniProfileWidget } from "@/components/user-profile/mini-profile-widget";
import type { DashboardNewsItem, DashboardTopic } from "./types";

type DashboardProps = {
  readonly news: readonly DashboardNewsItem[];
  readonly topics: readonly DashboardTopic[];
};

const filters: readonly { readonly id: string; readonly label: string; readonly active?: boolean }[] = [
  { id: "all", label: "Tümü", active: true },
  { id: "gundem", label: "Gündem" },
  { id: "finans", label: "Finans" },
  { id: "savunma", label: "Savunma" },
  { id: "enerji", label: "Enerji" },
  { id: "teknoloji", label: "Teknoloji" },
] as const;

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
  { id: "profile", label: "Profilim", icon: <UserIcon /> },
  { id: "leaderboard", label: "Liderlik", icon: <TrophyIcon /> },
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

export function Dashboard({ news, topics }: DashboardProps): JSX.Element {
  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = useState(320); // Başlangıç genişliği
  const [activeCategory, setActiveCategory] = useState('overview'); // Aktif kategori
  const MIN_WIDTH = 80; // Minimum genişlik (sadece iconlar)
  const MAX_WIDTH = 450; // Maksimum genişlik
  const COLLAPSED_THRESHOLD = 160; // Bu genişlikten küçükse collapsed sayılır

  const isCollapsed = sidebarWidth <= COLLAPSED_THRESHOLD;

  // Kategoriye göre haberleri filtrele
  const getFilteredNews = () => {
    switch (activeCategory) {
      case 'saved':
        return news.filter(item => item.tags.includes('favori')); // Kaydedilenler
      case 'audio':
        return news.filter(item => item.category === 'Podcast' || item.tags.includes('ses')); // Sesler
      case 'reports':
        return news.filter(item => item.category === 'Finans' || item.tags.includes('rapor')); // Raporlar
      case 'briefs':
        return news.filter(item => item.category === 'Gündem'); // Günlük
      case 'watch':
        return news.filter(item => item.category === 'Savunma'); // Takip
      default:
        return news; // Genel Akış - tüm haberler
    }
  };

  // Kategoriye göre başlık ve alt başlık
  const getCategoryInfo = () => {
    switch (activeCategory) {
      case 'saved':
        return {
          title: 'Kaydedilen Haberler',
          subtitle: 'Daha sonra okumak için kaydettigintiz haberler'
        };
      case 'audio':
        return {
          title: 'Sesli İçerikler',
          subtitle: 'Podcast ve sesli haber içerikleri'
        };
      case 'reports':
        return {
          title: 'Raporlar ve Analizler',
          subtitle: 'Derinlemesine analiz ve raporlar'
        };
      case 'briefs':
        return {
          title: 'Günlük Özetler',
          subtitle: 'Günün önemli gelişmeleri'
        };
      case 'watch':
        return {
          title: 'Takip Edilen Konular',
          subtitle: 'Takip ettiğiniz özel konular'
        };
      default:
        return {
          title: 'Günün Öne Çıkan Haberleri',
          subtitle: 'Anadolu Ajansı\'ndan son dakika gelişmeler'
        };
    }
  };

  // Kategori değiştirme handler'ı
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === 'profile' || categoryId === 'leaderboard' || categoryId === 'games') {
      // Bu kategoriler için yeni sayfaya yönlendir
      router.push(`/${categoryId}`);
    } else {
      // Diğer kategoriler için mevcut sayfada kategori değiştir
      setActiveCategory(categoryId);
    }
  };

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
          <div className="relative flex-1 overflow-y-auto">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#20324a_0%,rgba(25,37,58,0.94)_60%,#141b29_100%)]" aria-hidden />
            <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,#365982_0%,rgba(20,28,45,0.82)_70%,transparent_95%)] blur-[80px] opacity-80" aria-hidden />

            <div className="relative z-10 flex flex-col gap-10 px-6 pb-16 pt-10 sm:px-8 lg:px-12">
              <MobileLibrary topics={topics} />
              <DashboardHeader />

              <section className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <SearchBox />
                  <div className="flex flex-wrap items-center gap-2">
                    {filters.map((filter) => (
                      <FilterChip key={filter.id} label={filter.label} active={filter.active ?? false} />
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <DashboardNewsGrid 
                    items={getFilteredNews()}
                    title={getCategoryInfo().title}
                    subtitle={getCategoryInfo().subtitle}
                    showAll={true}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

type SidebarProps = {
  readonly width: number;
  readonly onWidthChange: (width: number) => void;
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly isCollapsed: boolean;
  readonly activeCategory: string;
  readonly onCategoryChange: (category: string) => void;
  readonly topics: readonly DashboardTopic[];
};

function Sidebar({ width, onWidthChange, minWidth, maxWidth, isCollapsed, activeCategory, onCategoryChange, topics }: SidebarProps): JSX.Element {
  const sidebarRef = useRef<HTMLElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    const deltaX = e.clientX - startXRef.current;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));
    onWidthChange(newWidth);
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

  return (
    <aside
      ref={sidebarRef}
      className="fixed left-0 top-0 z-40 h-screen overflow-hidden rounded-r-[36px] bg-gradient-to-br from-[#111f34] via-[#172d4c] to-[#0c1524] shadow-[0_32px_120px_rgba(5,16,32,0.65)] backdrop-blur-2xl transition-all duration-200 ease-out"
      style={{ width: `${width}px` }}
    >
      <div className="relative flex h-full flex-col overflow-hidden">
        <div className="absolute inset-0 bg-white/5" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(58,109,177,0.35),transparent_68%)]" aria-hidden />

        <div className="relative flex h-full flex-col">
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-[0_10px_28px_rgba(12,36,63,0.35)] transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                  aria-label="Yeni liste oluştur"
                >
                  <PlusIcon />
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
                  className={`group flex h-12 items-center rounded-2xl px-3 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 ${
                    isCollapsed ? 'justify-center gap-0' : 'justify-start gap-3'
                  } ${
                    isActive
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
                    className={`overflow-hidden text-sm font-medium transition-all duration-200 ${
                      isCollapsed ? 'max-w-0 opacity-0 -translate-x-2' : 'max-w-[160px] opacity-100 translate-x-0'
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

              <nav className="flex-1 overflow-y-auto px-6 pb-8 pt-4 scrollbar-hidden">
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
                className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 ${
                  isCollapsed ? 'shadow-[0_12px_28px_rgba(11,34,63,0.4)]' : 'shadow-[0_12px_28px_rgba(11,34,63,0.3)]'
                }`}
                aria-label={isCollapsed ? 'Kütüphaneyi genişlet' : 'Kütüphaneyi daralt'}
              >
                <span
                  className={`absolute transition-all duration-200 ${
                    isCollapsed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-y-2'
                  }`}
                >
                  <ExpandIcon />
                </span>
                <span
                  className={`absolute transition-all duration-200 ${
                    isCollapsed ? 'opacity-0 translate-y-2' : 'opacity-100 translate-x-0'
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

function DashboardHeader(): JSX.Element {
  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.42em] text-white/60">AA panoraması</p>
          <h1 className="text-[2rem] font-semibold leading-[1.15] text-white">Günün Akışına Anında Erişim</h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Modern akış deneyimini Anadolu Ajansı tonlarıyla buluşturan panoda gündem, piyasa ve saha haberlerini tek
            ekrandan yönetin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LivePill />
          <button
            type="button"
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
          >
            Bildirimleri yönet
          </button>
        </div>
      </div>
    </header>
  );
}

function LivePill(): JSX.Element {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full bg-[#0f6acd] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(9,100,177,0.3)] transition hover:bg-[#1173cc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
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
  return (
    <div className="relative flex min-w-[220px] flex-1 items-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white/80 shadow-[0_18px_50px_rgba(21,61,125,0.18)]">
      <SearchIcon />
      <input
        placeholder="Haber, şirket veya bölge ara"
        className="ml-3 flex-1 bg-transparent text-sm text-white placeholder:text-white/60 focus:outline-none"
        type="search"
      />
      <kbd className="hidden rounded-full border border-[#d3e1f5] bg-[#eff4fb] px-2 py-1 text-[0.65rem] font-semibold text-[#5a7397] sm:inline-block">
        ⌘K
      </kbd>
    </div>
  );
}

type FilterChipProps = {
  readonly label: string;
  readonly active?: boolean;
};

function FilterChip({ label, active }: FilterChipProps): JSX.Element {
  if (active) {
    return (
      <button
        type="button"
        className="rounded-full border border-white/30 bg-[#0f6acd] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(10,94,173,0.32)]"
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/20"
    >
      {label}
    </button>
  );
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

function CloseIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
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

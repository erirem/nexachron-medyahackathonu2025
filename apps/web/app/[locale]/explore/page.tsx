"use client";
import React, { useEffect, useRef, use, useState } from 'react';
import { useReelFeed } from '../../../components/reels/useReelFeed';
import ExploreGrid from '../../../components/reels/ExploreGrid';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '../(dashboard)/dashboard/_components/dashboard';
import type { DashboardTopic } from '../(dashboard)/dashboard/_components/types';
import { usePathname, useRouter } from 'next/navigation';

export default function ExplorePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const clientRef = useRef<QueryClient | null>(null);
    if (!clientRef.current) clientRef.current = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                gcTime: 1000 * 60 * 10, // 10 minutes
            },
        },
    });
    return (
        <QueryClientProvider client={clientRef.current}>
            <ExploreShell locale={locale} />
        </QueryClientProvider>
    );
}

function ExploreShell({ locale }: { locale: string }) {
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [activeNavItem, setActiveNavItem] = useState('reels');
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const router = useRouter();

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useReelFeed({
        category: selectedCategory,
    });

    const items = data?.pages.flatMap((p) => p.items) ?? [];

    // Fetch available categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const response = await fetch(`${apiUrl}/api/reels/list?limit=100`);
                const data = await response.json();

                // Extract unique categories
                const categories = new Set<string>();
                data.reels?.forEach((reel: any) => {
                    if (reel.category) {
                        categories.add(reel.category.toLowerCase());
                    }
                });

                setAvailableCategories(Array.from(categories).sort());
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                // Fallback to default categories
                setAvailableCategories(['gundem', 'ekonomi', 'spor', 'teknoloji', 'savunma', 'enerji', 'kultur']);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const onScroll = () => {
            if (!hasNextPage || isFetchingNextPage) return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400) {
                fetchNextPage();
            }
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    // Category mapping with Turkish labels and descriptions
    const categoryMap: Record<string, { title: string; description: string; sentiment: 'positive' | 'neutral' | 'negative' }> = {
        'all': { title: 'Tümü', description: 'Tüm kategoriler', sentiment: 'neutral' },
        'gundem': { title: 'Gündem', description: 'Güncel olaylar', sentiment: 'neutral' },
        'ekonomi': { title: 'Ekonomi', description: 'İş ve finans', sentiment: 'positive' },
        'spor': { title: 'Spor', description: 'Spor haberleri', sentiment: 'positive' },
        'teknoloji': { title: 'Teknoloji', description: 'Teknoloji dünyası', sentiment: 'positive' },
        'technology': { title: 'Teknoloji', description: 'Teknoloji dünyası', sentiment: 'positive' },
        'savunma': { title: 'Savunma', description: 'Savunma sanayii', sentiment: 'neutral' },
        'defense': { title: 'Savunma', description: 'Savunma sanayii', sentiment: 'neutral' },
        'enerji': { title: 'Enerji', description: 'Enerji sektörü', sentiment: 'neutral' },
        'energy': { title: 'Enerji', description: 'Enerji sektörü', sentiment: 'neutral' },
        'kultur': { title: 'Kültür', description: 'Kültür-sanat', sentiment: 'neutral' },
        'culture': { title: 'Kültür', description: 'Kültür-sanat', sentiment: 'neutral' },
        'saglik': { title: 'Sağlık', description: 'Sağlık haberleri', sentiment: 'neutral' },
        'health': { title: 'Sağlık', description: 'Sağlık haberleri', sentiment: 'neutral' },
        'egitim': { title: 'Eğitim', description: 'Eğitim ve bilim', sentiment: 'neutral' },
        'education': { title: 'Eğitim', description: 'Eğitim ve bilim', sentiment: 'neutral' },
        'siyaset': { title: 'Siyaset', description: 'Siyasi gelişmeler', sentiment: 'neutral' },
        'politics': { title: 'Siyaset', description: 'Siyasi gelişmeler', sentiment: 'neutral' },
        'dunya': { title: 'Dünya', description: 'Dünya haberleri', sentiment: 'neutral' },
        'world': { title: 'Dünya', description: 'Dünya haberleri', sentiment: 'neutral' },
        'cevre': { title: 'Çevre', description: 'Çevre ve doğa', sentiment: 'neutral' },
        'environment': { title: 'Çevre', description: 'Çevre ve doğa', sentiment: 'neutral' },
        'turizm': { title: 'Turizm', description: 'Turizm haberleri', sentiment: 'positive' },
        'tourism': { title: 'Turizm', description: 'Turizm haberleri', sentiment: 'positive' },
        'otomotiv': { title: 'Otomotiv', description: 'Otomotiv sektörü', sentiment: 'neutral' },
        'automotive': { title: 'Otomotiv', description: 'Otomotiv sektörü', sentiment: 'neutral' },
        'general': { title: 'Genel', description: 'Genel haberler', sentiment: 'neutral' },
    };

    // Build topics dynamically based on available categories
    const topics: DashboardTopic[] = [
        { id: 'all', title: 'Tümü', change: '', sentiment: 'neutral', description: 'Tüm kategoriler', icon: '' },
        ...availableCategories.map(cat => {
            const mapped = categoryMap[cat] || { title: cat.charAt(0).toUpperCase() + cat.slice(1), description: '', sentiment: 'neutral' as const };
            return {
                id: cat,
                title: mapped.title,
                change: '',
                sentiment: mapped.sentiment,
                description: mapped.description,
                icon: ''
            };
        })
    ];

    const handleCategoryChange = (categoryId: string) => {
        if (categoryId === 'overview') {
            router.push(`/${locale}/dashboard`);
        } else if (categoryId === 'profile') {
            router.push(`/${locale}/profile`);
        } else if (categoryId === 'reels') {
            setActiveNavItem('reels');
        } else {
            setActiveNavItem(categoryId);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1419] to-[#0a0e1a] text-white">
            {/* Dashboard Sidebar */}
            <Sidebar
                width={sidebarWidth}
                onWidthChange={setSidebarWidth}
                minWidth={80}
                maxWidth={450}
                isCollapsed={sidebarWidth <= 160}
                activeCategory={activeNavItem}
                onCategoryChange={handleCategoryChange}
                topics={topics}
            />

            {/* Main Content */}
            <main
                className="flex-1 transition-all duration-200"
                style={{ marginLeft: `${sidebarWidth}px` }}
            >
                {/* Top Category Bar */}
                <header className="sticky top-0 z-10 border-b border-white/10 bg-gradient-to-r from-[#0a0e1a]/95 via-[#0f1419]/95 to-[#0a0e1a]/95 backdrop-blur-xl">
                    <div className="px-6 py-4">
                        <h1 className="mb-3 text-2xl font-bold text-white">Keşfet</h1>

                        {/* Horizontal Category Pills */}
                        <div
                            className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {topics.map((topic) => {
                                const isActive = topic.id === 'all'
                                    ? !selectedCategory
                                    : selectedCategory === topic.id;

                                return (
                                    <button
                                        key={topic.id}
                                        onClick={() => {
                                            if (topic.id === 'all') {
                                                setSelectedCategory(undefined);
                                            } else {
                                                setSelectedCategory(topic.id);
                                            }
                                        }}
                                        className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${isActive
                                            ? 'bg-gradient-to-r from-[#0f6acd] to-[#1a8dff] text-white shadow-lg shadow-blue-500/30'
                                            : 'border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {getCategoryIcon(topic.id)}
                                        <span>{topic.title}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Loading indicator */}
                        {(isLoading || isFetchingNextPage) && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                                <span>{isLoading ? 'Yükleniyor...' : 'Daha fazla yükleniyor...'}</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Grid Content */}
                <div className="px-6 py-6">
                    <ExploreGrid items={items} locale={locale} />

                    {/* Loading indicator at bottom */}
                    {isFetchingNextPage && (
                        <div className="flex justify-center py-8">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
                        </div>
                    )}

                    {/* No more items */}
                    {!hasNextPage && items.length > 0 && (
                        <div className="py-8 text-center text-sm text-white/50">
                            Tüm içerikler yüklendi
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
                                <PlayCircleIcon />
                            </div>
                            <p className="text-lg font-medium text-white/70">Henüz içerik yok</p>
                            <p className="mt-2 text-sm text-white/50">Yakında yeni reels eklenecek</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// Category Icons
function getCategoryIcon(categoryId: string): React.JSX.Element {
    switch (categoryId.toLowerCase()) {
        case 'all':
            return <AllIcon />;
        case 'gundem':
        case 'siyaset':
        case 'politics':
            return <AgendaIcon />;
        case 'ekonomi':
        case 'economy':
            return <EconomyIcon />;
        case 'spor':
        case 'sports':
            return <SportsIcon />;
        case 'teknoloji':
        case 'technology':
            return <TechIcon />;
        case 'savunma':
        case 'defense':
            return <DefenseIcon />;
        case 'enerji':
        case 'energy':
            return <EnergyIcon />;
        case 'kultur':
        case 'culture':
        case 'saglik':
        case 'health':
            return <HealthIcon />;
        case 'dunya':
        case 'world':
            return <WorldIcon />;
        case 'egitim':
        case 'education':
            return <EducationIcon />;
        case 'cevre':
        case 'environment':
            return <EnvironmentIcon />;
        case 'turizm':
        case 'tourism':
            return <TourismIcon />;
        case 'otomotiv':
        case 'automotive':
            return <AutomotiveIcon />;
        case 'general':
            return <AllIcon />;
        default:
            return <AllIcon />;
    }
}

function AllIcon(): React.JSX.Element {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
        </svg>
    );
}

function AgendaIcon(): React.JSX.Element {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M3 10h18" />
        </svg>
    );
}

function EconomyIcon(): React.JSX.Element {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}

function SportsIcon(): React.JSX.Element {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8.14 12.14l1.72 1.72 4.28-4.28" />
        </svg>
    );
}

function TechIcon(): React.JSX.Element {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
    );
}

function DefenseIcon(): React.JSX.Element {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    );
}

function EnergyIcon(): React.JSX.Element {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
    );
}

function HealthIcon(): React.JSX.Element {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
        </svg>
    );
}

function WorldIcon(): React.JSX.Element {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}

function EducationIcon(): React.JSX.Element {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    );
}

function EnvironmentIcon(): React.JSX.Element {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
            <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        </svg>
    );
}

function TourismIcon(): React.JSX.Element {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.5 2H9.5L7 7l5 3 5-3-2.5-5z" />
            <path d="M12 10v12" />
            <path d="M8 22h8" />
        </svg>
    );
}

function AutomotiveIcon(): React.JSX.Element {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 17H2v-4l2-6h16l2 6v4h-3" />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
            <path d="M5 11h14" />
        </svg>
    );
}

function PlayCircleIcon(): React.JSX.Element {
    return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
        </svg>
    );
}




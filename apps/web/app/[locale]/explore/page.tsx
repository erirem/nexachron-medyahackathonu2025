"use client";
import React, { useEffect, useRef, use } from 'react';
import { useReelFeed } from '../../../components/reels/useReelFeed';
import ExploreGrid from '../../../components/reels/ExploreGrid';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '../(dashboard)/dashboard/_components/dashboard';
import type { DashboardTopic } from '../(dashboard)/dashboard/_components/types';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthState } from '@/contexts/auth-context';

export default function ExplorePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const { user, loading, onboardingStatusLoading, hasCompletedOnboarding } = useAuthState();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Wait for auth to finish loading
        if (loading || onboardingStatusLoading || hasCompletedOnboarding === null) {
            return;
        }

        // If user is not logged in, redirect to login
        if (!user) {
            const currentLocale = pathname?.split('/')[1] || 'tr';
            router.push(`/${currentLocale}/login`);
            return;
        }

        // If user is logged in but hasn't completed onboarding, redirect to onboarding
        if (user && !hasCompletedOnboarding) {
            const currentLocale = pathname?.split('/')[1] || 'tr';
            router.push(`/${currentLocale}/onboarding`);
            return;
        }
    }, [user, loading, onboardingStatusLoading, hasCompletedOnboarding, router, pathname]);

    // Show loading state while checking auth
    if (loading || onboardingStatusLoading || hasCompletedOnboarding === null) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-white mx-auto mb-6"></div>
                        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-gray-400 border-t-gray-600 mx-auto animate-spin-slow"></div>
                    </div>
                    <p className="text-lg font-medium text-white mb-2">Yükleniyor</p>
                    <p className="text-sm text-gray-400">Keşfet sayfası hazırlanıyor...</p>
                </div>
            </div>
        );
    }

    // If user is not logged in, don't show explore page (will redirect)
    if (!user) {
        return null;
    }

    const clientRef = useRef<QueryClient | null>(null);
    if (!clientRef.current) clientRef.current = new QueryClient();
    return (
        <QueryClientProvider client={clientRef.current}>
            <ExploreShell locale={locale} />
        </QueryClientProvider>
    );
}

function ExploreShell({ locale }: { locale: string }) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useReelFeed();
    const items = data?.pages.flatMap((p) => p.items) ?? [];

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

    return (
        <div className="flex min-h-screen bg-black text-white">
            <ExploreSidebar />
            <main className="flex-1 md:ml-[300px]">
                <header className="sticky top-0 z-10 border-b border-white/10 bg-black/70 px-4 py-3 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between">
                        <div className="text-sm text-white/80">
                            <span className="font-semibold">Senin için</span>
                            <span className="mx-2 text-white/50">Kişiselleştirilmemiş</span>
                        </div>
                    </div>
                </header>
                <div className="mx-auto w-full max-w-[1120px] px-2 sm:px-4">
                    <ExploreGrid items={items as any} locale={locale} />
                </div>
            </main>
        </div>
    );
}

function ExploreSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const currentLocale = pathname.split('/')[1] || 'tr';
    // Sidebar komponenti genişlik yönetimi gerektiriyor; keşfet için sabit genişlikte kullanıyoruz
    const topics: DashboardTopic[] = [
        { id: 't1', title: 'Gündem', change: '+Yeni', sentiment: 'neutral', description: 'Bugünün önemli başlıkları', icon: '' },
        { id: 't2', title: 'Spor', change: '+Trend', sentiment: 'positive', description: 'Saha ve skorlar', icon: '' },
        { id: 't3', title: 'Teknoloji', change: '⚡', sentiment: 'positive', description: 'Yenilikler', icon: '' },
    ];
    return (
        <Sidebar
            width={300}
            onWidthChange={() => { }}
            minWidth={300}
            maxWidth={300}
            isCollapsed={false}
            activeCategory={'reels'}
            onCategoryChange={(cat) => {
                if (cat === 'reels') return;
                if (cat === 'profile' || cat === 'leaderboard' || cat === 'quizzes') {
                    router.push(`/${currentLocale}/${cat}`);
                } else {
                    router.push(`/${currentLocale}/dashboard`);
                }
            }}
            topics={topics}
        />
    );
}



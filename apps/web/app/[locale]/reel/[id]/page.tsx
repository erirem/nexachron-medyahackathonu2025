"use client";
import React, { useEffect, useRef, useState, use } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactionBar from '../../../../components/reels/ReactionBar';
import { ReelPlayer } from '../../../../components/reels/ReelPlayer';
import { useReelPlayer, type ReelPlayerItem } from '../../../../components/reels/useReelPlayer';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuthState } from '@/contexts/auth-context';
import { fetchReelById, fetchExploreFeed } from '../../../../services/api';

export default function ReelPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { locale, id } = use(params);
    const { user, loading, onboardingStatusLoading } = useAuthState();
    const router = useRouter();
    const pathname = usePathname();

    // Hook'ları her zaman aynı sırada çağır
    const clientRef = useRef<QueryClient | null>(null);
    if (!clientRef.current) clientRef.current = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                gcTime: 1000 * 60 * 10, // 10 minutes
            },
        },
    });

    useEffect(() => {
        // Wait for auth to finish loading
        if (loading || onboardingStatusLoading) {
            return;
        }

        // If user is not logged in, redirect to login
        if (!user) {
            const currentLocale = pathname?.split('/')[1] || 'tr';
            router.push(`/${currentLocale}/login`);
            return;
        }

        // Reel sayfası için onboarding kontrolü kaldırıldı
        // Kullanıcı zaten giriş yapmış ve reel'e erişmeye çalışıyor
    }, [user, loading, onboardingStatusLoading, router, pathname]);

    // Show loading state while checking auth
    if (loading || onboardingStatusLoading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-white mx-auto mb-6"></div>
                        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-gray-400 border-t-gray-600 mx-auto animate-spin-slow"></div>
                    </div>
                    <p className="text-lg font-medium text-white mb-2">Yükleniyor</p>
                    <p className="text-sm text-gray-400">Reel hazırlanıyor...</p>
                </div>
            </div>
        );
    }

    // If user is not logged in, don't show reel page (will redirect)
    if (!user) {
        return null;
    }

    return (
        <QueryClientProvider client={clientRef.current}>
            <ReelInner locale={locale} id={id} />
        </QueryClientProvider>
    );
}

function ReelInner({ locale, id }: { locale: string; id: string }) {
    const [initial, setInitial] = useState<ReelPlayerItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const from = searchParams.get('from');

    useEffect(() => {
        async function loadInitialReel() {
            try {
                setIsLoading(true);

                // Try to fetch specific reel first
                try {
                    const reel = await fetchReelById(id);
                    setInitial({
                        id: reel.id,
                        title: reel.content.headline,
                        summary: reel.content.summary_sentences?.join(' ') || reel.content.captions || '',
                        category: reel.category,
                        videoUrl: reel.assets.video_url || '',
                        thumbUrl: reel.assets.thumbnail_url || reel.assets.background_image || '',
                        durationSec: reel.duration_seconds,
                        hrefId: reel.news_id,
                    });
                } catch (error) {
                    console.error('Failed to fetch reel by ID, falling back to explore feed:', error);

                    // Fallback: Get from explore feed
                    const exploreFeed = await fetchExploreFeed({ limit: 24 });
                    if (exploreFeed.items.length > 0) {
                        // Try to find the reel with matching ID, or use first one
                        const reelItem = exploreFeed.items.find(item => item.id === id) || exploreFeed.items[0];
                        setInitial(reelItem);
                    }
                }
            } catch (error) {
                console.error('Failed to load initial reel:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadInitialReel();
    }, [id]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
            </div>
        );
    }

    if (!initial) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
                <div className="text-center">
                    <p className="text-lg">Reel bulunamadı</p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
                    >
                        Geri Dön
                    </button>
                </div>
            </div>
        );
    }

    return <PlayerShell locale={locale} initial={initial} from={from} />;
}

function PlayerShell({ locale, initial, from }: { locale: string; initial: ReelPlayerItem; from: string | null }) {
    const { current, playing, setPlaying, go, onCompleted, like, dislike, isLoading } = useReelPlayer(initial);
    const router = useRouter();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 1000) + 100);
    const [viewCount] = useState(Math.floor(Math.random() * 5000) + 500);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Debug: Log when current changes
    useEffect(() => {
        console.log('Current reel changed:', current.id, '-', current.title);
    }, [current.id, current.title]);

    const onComment = () => alert('Yorumlar yakında');

    const handleLike = () => {
        if (!isLiked) {
            setLikeCount(likeCount + 1);
            setIsLiked(true);
            like();
        } else {
            setLikeCount(likeCount - 1);
            setIsLiked(false);
        }
    };

    const onShare = () => {
        if (navigator.share) {
            navigator.share({
                title: current.title,
                text: current.summary,
                url: location.href
            }).catch(() => {
                // Fallback: Copy to clipboard
                navigator.clipboard.writeText(location.href);
                alert('Link kopyalandı!');
            });
        } else {
            navigator.clipboard.writeText(location.href);
            alert('Link kopyalandı!');
        }
    };

    const onClose = () => {
        if (from === 'explore') {
            router.push(`/${locale}/explore`);
        } else {
            router.back();
        }
    };

    const categoryColors: Record<string, string> = {
        'teknoloji': 'from-blue-500 to-purple-600',
        'technology': 'from-blue-500 to-purple-600',
        'spor': 'from-green-500 to-emerald-600',
        'sports': 'from-green-500 to-emerald-600',
        'ekonomi': 'from-yellow-500 to-orange-600',
        'economy': 'from-yellow-500 to-orange-600',
        'gundem': 'from-red-500 to-pink-600',
        'agenda': 'from-red-500 to-pink-600',
        'savunma': 'from-slate-500 to-gray-600',
        'defense': 'from-slate-500 to-gray-600',
        'enerji': 'from-amber-500 to-yellow-600',
        'energy': 'from-amber-500 to-yellow-600',
        'kultur': 'from-purple-500 to-fuchsia-600',
        'culture': 'from-purple-500 to-fuchsia-600',
        'dunya': 'from-cyan-500 to-blue-600',
        'world': 'from-cyan-500 to-blue-600',
        'saglik': 'from-rose-500 to-red-600',
        'health': 'from-rose-500 to-red-600',
        'siyaset': 'from-indigo-500 to-purple-600',
        'politics': 'from-indigo-500 to-purple-600',
        'default': 'from-white/30 to-white/20',
    };

    const categoryGradient = categoryColors[current.category?.toLowerCase()] || categoryColors['default'];

    return (
        <div className="fixed inset-0 bg-black">
            <div className="mx-auto flex h-full max-w-5xl">
                <div className="relative mx-auto flex h-full w-full items-center justify-center">
                    <div className="relative aspect-[9/16] h-full max-h-full overflow-hidden bg-black shadow-2xl">
                        <ReelPlayer reel={current} onWatch75={onCompleted} playing={playing} isMuted={isMuted} setIsMuted={setIsMuted} />

                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
                                <div className="flex flex-col items-center gap-3 rounded-xl bg-black/60 px-6 py-4 shadow-2xl">
                                    <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
                                    <p className="text-sm font-semibold tracking-wide text-white">Sonraki reel yükleniyor...</p>
                                </div>
                            </div>
                        )}

                        {/* Top Bar - Modern Transparent */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/50 via-black/20 to-transparent p-4 pb-24">
                            {/* Close Button */}
                            <div className="pointer-events-auto mb-3 flex items-center justify-between">
                                <button
                                    onClick={onClose}
                                    className="group flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white transition-all hover:scale-110 hover:bg-black/50 ring-1 ring-white/10"
                                    aria-label="Kapat"
                                >
                                    <svg className="transition-transform group-hover:rotate-90" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>

                                {/* Category Badge & Volume Control */}
                                <div className="flex flex-col items-end gap-2">
                                    {/* Category Badge - Colorful Gradient */}
                                    <div
                                        className={`pointer-events-auto rounded-xl bg-gradient-to-r ${categoryGradient} px-3 py-1.5 shadow-lg ring-1 ring-white/20`}
                                    >
                                        <span className="text-xs font-bold uppercase tracking-wider text-white drop-shadow-lg">
                                            {current.category}
                                        </span>
                                    </div>

                                    {/* Volume Control - Transparent */}
                                    <button
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="pointer-events-auto rounded-full bg-black/30 backdrop-blur-md p-2 transition-all hover:scale-110 hover:bg-black/50 ring-1 ring-white/10"
                                        aria-label={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                                    >
                                        {isMuted ? (
                                            // Muted icon - Red
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                                <line x1="23" y1="9" x2="17" y2="15"></line>
                                                <line x1="17" y1="9" x2="23" y2="15"></line>
                                            </svg>
                                        ) : (
                                            // Unmuted icon - White
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Source Info */}
                            <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-black/20 backdrop-blur-md py-2 px-3 ring-1 ring-white/10 w-fit">
                                <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${categoryGradient} text-sm font-bold text-white shadow-lg`}
                                >
                                    NA
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white drop-shadow-lg">Nexachron</p>
                                    <p className="text-xs text-white/80 drop-shadow-lg">Haber Merkezi</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Actions - Instagram Style */}
                        <div className="pointer-events-none absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-4">
                            {/* Like */}
                            <button
                                onClick={handleLike}
                                className="pointer-events-auto group flex flex-col items-center transition-all hover:scale-110"
                            >
                                <svg
                                    className="transition-all group-hover:scale-110"
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill={isLiked ? "#ef4444" : "none"}
                                    stroke="white"
                                    strokeWidth="2.5"
                                    style={{
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                                        strokeWidth: isLiked ? '0' : '2.5'
                                    }}
                                >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span className="mt-1 text-[11px] font-bold text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                                    {likeCount > 999 ? `${(likeCount / 1000).toFixed(1)}K` : likeCount}
                                </span>
                            </button>

                            {/* Comment */}
                            <button
                                onClick={onComment}
                                className="pointer-events-auto group flex flex-col items-center transition-all hover:scale-110"
                            >
                                <svg
                                    className="transition-all group-hover:scale-110"
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                                >
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <span className="mt-1 text-[11px] font-bold text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>156</span>
                            </button>

                            {/* Share */}
                            <button
                                onClick={onShare}
                                className="pointer-events-auto group flex flex-col items-center transition-all hover:scale-110"
                            >
                                <svg
                                    className="transition-all group-hover:scale-110"
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                                >
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                                    <polyline points="16 6 12 2 8 6"></polyline>
                                    <line x1="12" y1="2" x2="12" y2="15"></line>
                                </svg>
                                <span className="mt-1 text-[11px] font-bold text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>Paylaş</span>
                            </button>

                            {/* Bookmark */}
                            <button
                                className="pointer-events-auto group flex flex-col items-center transition-all hover:scale-110"
                            >
                                <svg
                                    className="transition-all group-hover:scale-110"
                                    width="26"
                                    height="26"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                                >
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Bottom Info - Modern Transparent */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 via-black/30 to-transparent px-4 pb-5 pt-24">
                            {/* Stats - Transparent Container */}
                            <div className="pointer-events-auto mb-3 flex items-center gap-3 rounded-full bg-black/20 backdrop-blur-md px-3 py-1.5 text-[10px] text-white/90 w-fit ring-1 ring-white/10">
                                <div className="flex items-center gap-1.5">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                    <span className="font-bold">{viewCount > 999 ? `${(viewCount / 1000).toFixed(1)}K` : viewCount}</span>
                                </div>
                                <div className="h-3 w-px bg-white/20"></div>
                                <div className="flex items-center gap-1.5">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    <span className="font-medium">2 saat önce</span>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="pointer-events-auto mb-2 text-base font-bold leading-tight text-white drop-shadow-2xl">
                                {current.title}
                            </h2>

                            {/* Description */}
                            <div className="pointer-events-auto relative">
                                <p
                                    className={`text-xs leading-relaxed text-white/95 drop-shadow-lg ${showFullDescription ? '' : 'line-clamp-2'
                                        }`}
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                >
                                    {current.summary}
                                </p>
                                {current.summary.length > 100 && (
                                    <button
                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                        className="mt-1 text-[11px] font-bold text-white hover:underline drop-shadow-lg"
                                    >
                                        {showFullDescription ? 'Daha az' : 'Devamını oku'}
                                    </button>
                                )}
                            </div>

                            {/* Hashtags - Modern Pills */}
                            <div className="pointer-events-auto mt-3 flex flex-wrap gap-2">
                                <span className="rounded-lg bg-black/30 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white ring-1 ring-white/10">
                                    #{current.category?.toLowerCase() || 'gündem'}
                                </span>
                                <span className="rounded-lg bg-black/30 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white ring-1 ring-white/10">
                                    #gündem
                                </span>
                                <span className="rounded-lg bg-black/30 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white ring-1 ring-white/10">
                                    #haber
                                </span>
                            </div>
                        </div>

                        {/* Navigation Hints - Modern Minimal */}
                        <div className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center opacity-0 transition-all duration-300 hover:opacity-100">
                            <div className="rounded-xl bg-black/40 backdrop-blur-lg px-4 py-2 ring-1 ring-white/10 shadow-xl">
                                <p className="flex items-center gap-2 text-xs font-semibold text-white">
                                    <span className="text-base">↑</span> Önceki
                                </p>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-x-0 bottom-1/3 flex justify-center opacity-0 transition-all duration-300 hover:opacity-100">
                            <div className="rounded-xl bg-black/40 backdrop-blur-lg px-4 py-2 ring-1 ring-white/10 shadow-xl">
                                <p className="flex items-center gap-2 text-xs font-semibold text-white">
                                    <span className="text-base">↓</span> Sonraki
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


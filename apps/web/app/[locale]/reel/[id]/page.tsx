"use client";
import React, { useEffect, useRef, useState, use } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactionBar from '../../../../components/reels/ReactionBar';
import { ReelPlayer } from '../../../../components/reels/ReelPlayer';
import { useReelPlayer, type ReelPlayerItem } from '../../../../components/reels/useReelPlayer';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchReelById, fetchExploreFeed } from '../../../../services/api';

export default function ReelPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { locale, id } = use(params);
    const clientRef = useRef<QueryClient | null>(null);
    if (!clientRef.current) clientRef.current = new QueryClient();

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
        'teknoloji': 'from-blue-500/80 to-purple-600/80',
        'spor': 'from-green-500/80 to-emerald-600/80',
        'ekonomi': 'from-yellow-500/80 to-orange-600/80',
        'gundem': 'from-red-500/80 to-pink-600/80',
        'savunma': 'from-slate-500/80 to-gray-600/80',
        'enerji': 'from-amber-500/80 to-yellow-600/80',
        'kultur': 'from-purple-500/80 to-fuchsia-600/80',
        'default': 'from-white/20 to-white/10',
    };

    const categoryGradient = categoryColors[current.category] || categoryColors['default'];

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

                        {/* Top Bar - Instagram Style */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-transparent p-4 pb-24">
                            {/* Close Button */}
                            <div className="pointer-events-auto mb-3 flex items-center justify-between">
                                <button
                                    onClick={onClose}
                                    className="group flex h-9 w-9 items-center justify-center text-white transition-all hover:scale-110"
                                    aria-label="Kapat"
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                                >
                                    <svg className="transition-transform group-hover:rotate-90" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>

                                {/* Category Badge & Volume Control */}
                                <div className="flex flex-col items-end gap-2">
                                    <div
                                        className="pointer-events-auto rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm"
                                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                                    >
                                        <span className="text-xs font-bold uppercase tracking-wider text-white">
                                            {current.category}
                                        </span>
                                    </div>

                                    {/* Volume Control - Transparent */}
                                    <button
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="pointer-events-auto transition-all hover:scale-110"
                                        aria-label={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                                    >
                                        {isMuted ? (
                                            // Muted icon
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                                <line x1="23" y1="9" x2="17" y2="15"></line>
                                                <line x1="17" y1="9" x2="23" y2="15"></line>
                                            </svg>
                                        ) : (
                                            // Unmuted icon
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Source Info */}
                            <div className="pointer-events-auto flex items-center gap-3">
                                <div
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white"
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
                                >
                                    NA
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>Nexachron</p>
                                    <p className="text-xs text-white/90" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>Haber Merkezi</p>
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

                        {/* Bottom Info - Instagram Style */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/50 via-transparent to-transparent px-4 pb-4 pt-20">
                            {/* Stats */}
                            <div className="pointer-events-auto mb-2 flex items-center gap-3 text-[10px] text-white/90" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>
                                <div className="flex items-center gap-1">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                    <span className="font-semibold">{viewCount > 999 ? `${(viewCount / 1000).toFixed(1)}K` : viewCount}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    <span>2 saat önce</span>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="pointer-events-auto mb-1.5 text-base font-bold leading-tight text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>
                                {current.title}
                            </h2>

                            {/* Description */}
                            <div className="pointer-events-auto relative">
                                <p
                                    className={`text-xs leading-snug text-white/90 ${showFullDescription ? '' : 'line-clamp-2'
                                        }`}
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}
                                >
                                    {current.summary}
                                </p>
                                {current.summary.length > 100 && (
                                    <button
                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                        className="mt-0.5 text-[10px] font-semibold text-white/90 hover:underline"
                                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}
                                    >
                                        {showFullDescription ? 'Daha az' : 'Devamını oku'}
                                    </button>
                                )}
                            </div>

                            {/* Hashtags */}
                            <div className="pointer-events-auto mt-2 flex flex-wrap gap-1.5">
                                <span className="text-[10px] font-medium text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>
                                    #{current.category}
                                </span>
                                <span className="text-[10px] font-medium text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>
                                    #gündem
                                </span>
                                <span className="text-[10px] font-medium text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>
                                    #haber
                                </span>
                            </div>
                        </div>

                        {/* Navigation Hints - Improved */}
                        <div className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center opacity-0 transition-opacity hover:opacity-100">
                            <div className="rounded-2xl bg-black/70 px-5 py-2.5 backdrop-blur-md">
                                <p className="flex items-center gap-2 text-sm font-medium text-white">
                                    <span className="text-lg">↑</span> Kaydır veya yukarı ok tuşu
                                </p>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-x-0 bottom-1/3 flex justify-center opacity-0 transition-opacity hover:opacity-100">
                            <div className="rounded-2xl bg-black/70 px-5 py-2.5 backdrop-blur-md">
                                <p className="flex items-center gap-2 text-sm font-medium text-white">
                                    <span className="text-lg">↓</span> Kaydır veya aşağı ok tuşu
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



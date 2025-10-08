"use client";
import React, { useEffect, useMemo, useRef, useState, use } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Reel } from '../../../../lib/types/reels';
import ReactionBar from '../../../../components/reels/ReactionBar';
import ReelPlayer from '../../../../components/reels/ReelPlayer';
import { useReelPlayer } from '../../../../components/reels/useReelPlayer';
import { useRouter } from 'next/navigation';

export default function ReelPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { id } = use(params);
    const clientRef = useRef<QueryClient | null>(null);
    if (!clientRef.current) clientRef.current = new QueryClient();
    return (
        <QueryClientProvider client={clientRef.current}>
            <ReelInner id={id} />
        </QueryClientProvider>
    );
}

function ReelInner({ id }: { id: string }) {
    const [initial, setInitial] = useState<Reel | null>(null);
    useEffect(() => {
        // basit: explore API'den ilk sayfayı çekip id eşleşeni bul
        fetch(`/api/reels?limit=50`).then(r => r.json()).then((p) => {
            const f = (p.items as Reel[]).find((x) => x.id === id) || p.items[0];
            setInitial(f);
        });
    }, [id]);

    if (!initial) return null;
    return <PlayerShell initial={initial} />;
}

function PlayerShell({ initial }: { initial: Reel }) {
    const { current, playing, setPlaying, go, onCompleted, like, dislike } = useReelPlayer(initial);
    const router = useRouter();
    const onComment = () => alert('Yorumlar yakında');
    const onShare = () => navigator.share?.({ title: current.title, url: location.href }).catch(() => alert('Paylaşım yapılamadı')) || alert('Paylaşım yakında');
    const onClose = () => {
        router.push('/explore');
    };

    return (
        <div className="fixed inset-0 bg-black">
            <div className="mx-auto flex h-full max-w-5xl px-4 py-6">
                <div className="relative mx-auto flex h-full w-full items-center justify-center">
                    <div className="relative aspect-[9/16] h-full max-h-full overflow-hidden rounded-lg bg-black">
                        <ReelPlayer reel={current} onWatch75={onCompleted} playing={playing} />
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <ReactionBar onLike={like} onDislike={dislike} onComment={onComment} onShare={onShare} />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                                <h2 className="text-lg font-semibold">{current.title}</h2>
                                <p className="mt-1 text-sm opacity-90 line-clamp-2">{current.summary}</p>
                            </div>
                        </div>
                        <div className="pointer-events-auto absolute left-3 top-3">
                            <button
                                onClick={onClose}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white/50"
                                aria-label="Kapat"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



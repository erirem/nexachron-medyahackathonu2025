"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Reel } from '../../lib/types/reels';
import { getProfileVector, onReaction, onSkip, onWatchComplete, serializeProfileVector } from '../../lib/recommend';

export function useReelPlayer(initial: Reel) {
    const [current, setCurrent] = useState<Reel>(initial);
    const [playing, setPlaying] = useState(true);
    const lastSwitchRef = useRef<number>(Date.now());

    const profileParam = useMemo(() => serializeProfileVector(getProfileVector()), []);

    const go = useCallback(async (dir: 'up' | 'down') => {
        const start = Date.now();
        const res = await fetch(`/api/reels/${current.id}/next?dir=${dir}&profile=${profileParam}`, { cache: 'no-store' });
        const data = await res.json();
        const elapsed = Date.now() - start;
        // Skip signal if short watch
        if (elapsed < 1500) onSkip(current);
        setCurrent(data.item);
        lastSwitchRef.current = Date.now();
    }, [current, profileParam]);

    const onKey = useCallback((e: KeyboardEvent) => {
        if (e.key === 'ArrowUp') go('down');
        if (e.key === 'ArrowDown') go('up');
    }, [go]);

    useEffect(() => {
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onKey]);

    const onWheel = useCallback((e: WheelEvent) => {
        if (e.deltaY > 30) go('up');
        if (e.deltaY < -30) go('down');
    }, [go]);

    useEffect(() => {
        window.addEventListener('wheel', onWheel, { passive: true });
        return () => window.removeEventListener('wheel', onWheel);
    }, [onWheel]);

    const onTouch = useTouchSwipe(go);

    return {
        current,
        playing,
        setPlaying,
        go,
        onTouch,
        onCompleted: () => onWatchComplete(current),
        like: () => onReaction(current, 1),
        dislike: () => onReaction(current, -1),
    };
}

function useTouchSwipe(go: (dir: 'up' | 'down') => void) {
    const startRef = useRef<number | null>(null);
    useEffect(() => {
        const onStart = (e: TouchEvent) => {
            startRef.current = e.touches[0].clientY;
        };
        const onEnd = (e: TouchEvent) => {
            const s = startRef.current;
            if (s == null) return;
            const dy = e.changedTouches[0].clientY - s;
            if (Math.abs(dy) > 40) {
                go(dy < 0 ? 'up' : 'down');
            }
            startRef.current = null;
        };
        window.addEventListener('touchstart', onStart, { passive: true });
        window.addEventListener('touchend', onEnd, { passive: true });
        return () => {
            window.removeEventListener('touchstart', onStart);
            window.removeEventListener('touchend', onEnd);
        };
    }, [go]);
    return {} as const;
}



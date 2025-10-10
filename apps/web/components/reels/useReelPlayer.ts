"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchNextReel } from '../../services/api';

export interface ReelPlayerItem {
    id: string;
    title: string;
    summary: string;
    category: string;
    videoUrl: string;
    thumbUrl: string;
    durationSec: number;
    hrefId?: string;
}

const THROTTLE_MS = 800; // Minimum time between reel switches

export function useReelPlayer(initial: ReelPlayerItem) {
    const [current, setCurrent] = useState<ReelPlayerItem>(initial);
    const [playing, setPlaying] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const lastSwitchRef = useRef<number>(0);
    const pendingDirectionRef = useRef<'up' | 'down' | null>(null);

    const go = useCallback(async (dir: 'up' | 'down') => {
        const now = Date.now();
        const timeSinceLastSwitch = now - lastSwitchRef.current;

        // Throttle: prevent rapid successive switches
        if (timeSinceLastSwitch < THROTTLE_MS) {
            console.log(`Throttled: ${timeSinceLastSwitch}ms since last switch (min: ${THROTTLE_MS}ms)`);
            pendingDirectionRef.current = dir; // Remember last direction
            return;
        }

        // Prevent multiple concurrent requests
        if (isLoading) {
            console.log('Already loading, ignoring request');
            return;
        }

        setIsLoading(true);
        lastSwitchRef.current = now; // Update immediately to prevent double requests
        pendingDirectionRef.current = null;

        try {
            console.log(`Fetching ${dir} reel from ${current.id}`);
            const data = await fetchNextReel(current.id, { dir });

            console.log(`Successfully loaded reel: ${data.item.id} - ${data.item.title}`);
            setCurrent(data.item);
            setPlaying(true); // Auto-play next reel
        } catch (error) {
            console.error('Failed to load next reel:', error);
            // Restore throttle on error so user can retry
            lastSwitchRef.current = now - THROTTLE_MS;
        } finally {
            setIsLoading(false);
        }
    }, [current.id, isLoading]);

    const onKey = useCallback((e: KeyboardEvent) => {
        e.preventDefault();
        if (e.key === 'ArrowUp') go('down');
        if (e.key === 'ArrowDown') go('up');
    }, [go]);

    useEffect(() => {
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onKey]);

    const onWheel = useCallback((e: WheelEvent) => {
        // Ignore very small scrolls (touchpad noise)
        if (Math.abs(e.deltaY) < 50) return;

        // Determine direction
        const dir = e.deltaY > 0 ? 'up' : 'down';
        go(dir);
    }, [go]);

    useEffect(() => {
        // Use passive: false to allow preventDefault if needed
        const wheelHandler = (e: WheelEvent) => {
            if (Math.abs(e.deltaY) >= 50) {
                e.preventDefault(); // Prevent page scroll
                onWheel(e);
            }
        };

        window.addEventListener('wheel', wheelHandler, { passive: false });
        return () => window.removeEventListener('wheel', wheelHandler);
    }, [onWheel]);

    const onTouch = useTouchSwipe(go);

    return {
        current,
        playing,
        setPlaying,
        go,
        onTouch,
        isLoading,
        onCompleted: () => {
            console.log('Reel completed:', current.title);
        },
        like: () => {
            console.log('Liked:', current.title);
        },
        dislike: () => {
            console.log('Disliked:', current.title);
        },
    };
}

function useTouchSwipe(go: (dir: 'up' | 'down') => void) {
    const startRef = useRef<number | null>(null);
    const lastTouchTimeRef = useRef<number>(0);

    useEffect(() => {
        const onStart = (e: TouchEvent) => {
            startRef.current = e.touches[0].clientY;
        };

        const onEnd = (e: TouchEvent) => {
            const s = startRef.current;
            if (s == null) return;

            const now = Date.now();
            const timeSinceLastTouch = now - lastTouchTimeRef.current;

            // Throttle touch events too
            if (timeSinceLastTouch < THROTTLE_MS) {
                console.log(`Touch throttled: ${timeSinceLastTouch}ms since last touch`);
                startRef.current = null;
                return;
            }

            const dy = e.changedTouches[0].clientY - s;
            if (Math.abs(dy) > 80) { // Higher threshold for touch (more intentional)
                lastTouchTimeRef.current = now;
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



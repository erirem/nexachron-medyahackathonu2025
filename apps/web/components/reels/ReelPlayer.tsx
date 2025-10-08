"use client";
import { useEffect, useRef } from 'react';
import type { Reel } from '../../lib/types/reels';

type Props = {
    reel: Reel;
    onWatch75: () => void;
    playing: boolean;
};

export function ReelPlayer({ reel, onWatch75, playing }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const sentRef = useRef(false);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        if (playing) v.play().catch(() => { });
        else v.pause();
    }, [playing]);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const onTime = () => {
            if (sentRef.current) return;
            const threshold = 0.75 * reel.durationSec;
            if (v.currentTime >= threshold) {
                sentRef.current = true;
                onWatch75();
            }
        };
        v.addEventListener('timeupdate', onTime);
        return () => v.removeEventListener('timeupdate', onTime);
    }, [onWatch75, reel.durationSec]);

    return (
        <video
            ref={videoRef}
            src={reel.videoUrl}
            className="h-full w-full object-cover"
            playsInline
            muted
            loop
            poster={reel.thumbUrl}
            onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                if (v.paused) {
                    v.play().catch(() => { });
                } else {
                    v.pause();
                }
            }}
        />
    );
}

export default ReelPlayer;



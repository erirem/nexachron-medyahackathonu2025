"use client";
import { useEffect, useRef } from 'react';

type Props = {
    reel: {
        videoUrl: string;
        thumbUrl: string;
        durationSec: number;
    };
    onWatch75: () => void;
    playing: boolean;
    isMuted: boolean;
    setIsMuted: (muted: boolean) => void;
};

export function ReelPlayer({ reel, onWatch75, playing, isMuted, setIsMuted }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const sentRef = useRef(false);

    // Video değiştiğinde veya playing state değiştiğinde
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        // Reset sentRef when video changes
        sentRef.current = false;

        if (playing) {
            // Video src değiştiğinde veya play'e basıldığında
            // Önce muted=false ile dene
            v.muted = isMuted;
            v.play().catch(() => {
                // Eğer tarayıcı unmuted autoplay'e izin vermezse, muted başlat
                if (!isMuted) {
                    v.muted = true;
                    setIsMuted(true);
                    v.play().catch(() => { });
                }
            });
        } else {
            v.pause();
        }
    }, [playing, reel.videoUrl, isMuted]);

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
        <div className="relative h-full w-full">
            <video
                ref={videoRef}
                src={reel.videoUrl}
                className="h-full w-full object-cover"
                playsInline
                muted={isMuted}
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
        </div>
    );
}
"use client";
import Link from 'next/link';
import { useMemo } from 'react';
import type { ExploreItem } from '../../services/api';

type Props = { items: ExploreItem[]; locale: string };

// Category name mapping for display
const categoryNames: Record<string, string> = {
    'gundem': 'GÜNDEM',
    'economy': 'EKONOMİ',
    'sports': 'SPOR',
    'world': 'DÜNYA',
    'culture': 'KÜLTÜR',
    'tech': 'TEKNOLOJİ',
    'teknoloji': 'TEKNOLOJİ',
    'savunma': 'SAVUNMA',
    'enerji': 'ENERJİ',
    'finans': 'FİNANS',
    'diplomasi': 'DİPLOMASİ',
    'general': 'GENEL',
};

// Category gradient colors
const categoryGradients: Record<string, string> = {
    'gundem': 'from-red-500/90 to-pink-600/90',
    'ekonomi': 'from-yellow-500/90 to-orange-600/90',
    'economy': 'from-yellow-500/90 to-orange-600/90',
    'spor': 'from-green-500/90 to-emerald-600/90',
    'sports': 'from-green-500/90 to-emerald-600/90',
    'teknoloji': 'from-blue-500/90 to-purple-600/90',
    'tech': 'from-blue-500/90 to-purple-600/90',
    'savunma': 'from-slate-500/90 to-gray-600/90',
    'defense': 'from-slate-500/90 to-gray-600/90',
    'enerji': 'from-amber-500/90 to-yellow-600/90',
    'energy': 'from-amber-500/90 to-yellow-600/90',
    'kultur': 'from-purple-500/90 to-fuchsia-600/90',
    'culture': 'from-purple-500/90 to-fuchsia-600/90',
    'world': 'from-cyan-500/90 to-blue-600/90',
    'dunya': 'from-cyan-500/90 to-blue-600/90',
    'saglik': 'from-rose-500/90 to-red-600/90',
    'health': 'from-rose-500/90 to-red-600/90',
    'default': 'from-white/30 to-white/20',
};

export function ExploreGrid({ items, locale }: Props) {
    const cols = useMemo(() => ({ base: 4, md: 5, xl: 7 }), []);

    return (
        <div className="min-h-screen px-0">
            <div className="grid gap-2.5"
                style={{ gridTemplateColumns: `repeat(${cols.base}, minmax(0, 1fr))` }}>
                {items.filter(it => it && it.id).map((it, idx) => {
                    const href = `/${locale}/reel/${it.id}?from=explore`;
                    const isTall = idx % 7 === 3; // Every 7th item (at position 3) is taller
                    const categoryDisplay = categoryNames[it.category] || it.category.toUpperCase();
                    const categoryGradient = categoryGradients[it.category.toLowerCase()] || categoryGradients['default'];

                    return (
                        <Link
                            key={`${it.kind}-${it.id}-${idx}`}
                            href={href}
                            className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 ring-1 ring-white/5 hover:ring-white/10"
                            style={{ paddingTop: isTall ? '180%' : '140%' }}
                        >
                            {/* Thumbnail Image */}
                            <div className="absolute inset-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={it.thumbUrl}
                                    alt={it.title}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-75"
                                />
                                {/* Gradient overlay always visible */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Glow effect on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-t ${categoryGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-2.5 text-white transform transition-transform duration-300 group-hover:translate-y-0">
                                {/* Category Badge */}
                                <div className="mb-1.5 flex items-center gap-2">
                                    <span className={`inline-block bg-gradient-to-r ${categoryGradient} backdrop-blur-sm px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider shadow-lg`}>
                                        {categoryDisplay}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="line-clamp-2 text-xs font-bold leading-tight drop-shadow-lg transition-all duration-300 group-hover:text-white">
                                    {it.title}
                                </h3>
                            </div>

                            {/* Reel Badge - Top Right */}
                            <div className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-1 shadow-lg ring-1 ring-white/10">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                                    <circle cx="12" cy="12" r="10" opacity="0.3" />
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                <span className="text-[9px] font-semibold text-white">REEL</span>
                            </div>

                            {/* Play Icon Overlay - Smaller */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                                <div className="relative">
                                    {/* Glow ring */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${categoryGradient} rounded-full blur-lg opacity-50`}></div>
                                    {/* Play button */}
                                    <div className="relative bg-white rounded-full p-3 shadow-2xl">
                                        <svg
                                            className="w-6 h-6 text-black ml-0.5"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <style jsx>{`
        @media (min-width: 768px) {
          div[style] { grid-template-columns: repeat(${cols.md}, minmax(0, 1fr)); }
        }
        @media (min-width: 1280px) {
          div[style] { grid-template-columns: repeat(${cols.xl}, minmax(0, 1fr)); }
        }
      `}</style>
        </div>
    );
}

export default ExploreGrid;




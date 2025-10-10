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

export function ExploreGrid({ items, locale }: Props) {
    const cols = useMemo(() => ({ base: 4, md: 6, xl: 8 }), []);

    return (
        <div className="min-h-screen bg-black px-0 py-4">
            <div className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${cols.base}, minmax(0, 1fr))` }}>
                {items.map((it, idx) => {
                    const href = `/${locale}/reel/${it.id}?from=explore`;
                    const isTall = idx % 5 === 4; // Every 5th item is taller
                    const categoryDisplay = categoryNames[it.category] || it.category.toUpperCase();

                    return (
                        <Link
                            key={`${it.kind}-${it.id}-${idx}`}
                            href={href}
                            className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
                            style={{ paddingTop: isTall ? '200%' : '100%' }}
                        >
                            {/* Thumbnail Image */}
                            <div className="absolute inset-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={it.thumbUrl}
                                    alt={it.title}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                {/* Dark overlay on hover */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 text-white">
                                {/* Category Badge */}
                                <div className="mb-2">
                                    <span className="inline-block bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold tracking-wider">
                                        {categoryDisplay}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="line-clamp-2 text-sm font-bold leading-tight group-hover:text-white/90 transition-colors">
                                    {it.title}
                                </h3>
                            </div>

                            {/* Reel Badge */}
                            <div className="absolute right-2 top-2 rounded-full bg-black/70 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
                                reel
                            </div>

                            {/* Play Icon Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-white/90 rounded-full p-4 shadow-2xl">
                                    <svg
                                        className="w-8 h-8 text-black"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
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




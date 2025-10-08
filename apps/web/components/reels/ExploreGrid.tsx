"use client";
import Link from 'next/link';
import { useMemo } from 'react';
import type { ExploreItem } from '../../lib/types/reels';

type Props = { items: ExploreItem[]; locale: string };

export function ExploreGrid({ items, locale }: Props) {
    const cols = useMemo(() => ({ base: 4, md: 6, xl: 8 }), []);
    return (
        <div className="min-h-screen bg-black px-0 py-4">
            <div className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${cols.base}, minmax(0, 1fr))` }}>
                {items.map((it, idx) => {
                    const isReel = it.kind === 'reel';
                    const href = isReel ? `/${locale}/reel/${it.id}?from=explore` : `/${locale}/(dashboard)/haber/${it.hrefId}`;
                    const isTall = idx % 5 === 4; // 4 kare + 1 dikey
                    const src = it.thumbUrl;
                    return (
                        <Link key={`${it.kind}-${it.id}-${idx}`} href={href} className={`group relative overflow-hidden rounded-sm`} style={{ paddingTop: isTall ? '200%' : '100%' }}>
                            <div className="absolute inset-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt={it.title} loading="lazy" className={`h-full w-full object-cover transition-transform duration-200 group-hover:scale-105 group-hover:opacity-90 ${isTall && isReel ? '' : ''}`} />
                            </div>
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-white">
                                <p className="text-[10px] uppercase tracking-wide text-white/70">{('category' in it ? it.category : 'news')}</p>
                                <p className="line-clamp-2 text-[11px] font-semibold">{it.title}</p>
                            </div>
                            <div className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                                {isReel ? 'reel' : 'foto'}
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




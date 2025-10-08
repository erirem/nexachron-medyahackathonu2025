"use client";
import type { Reel } from '../../lib/types/reels';

export default function CommentsStub({ reel }: { reel: Reel }) {
    const items = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        author: `kullanici${i + 1}`,
        text: i % 3 === 0 ? 'Harika çekim!' : i % 3 === 1 ? 'İnanılmaz an 🔥' : 'Katılıyorum 👍',
        time: `${Math.max(1, 9 - (i % 5))}s`
    }));

    return (
        <aside className="flex h-full w-full flex-col">
            <header className="flex items-center gap-3 border-b border-white/10 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={reel.thumbUrl} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{reel.title}</p>
                    <p className="text-xs text-white/60">{reel.category}</p>
                </div>
            </header>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {items.map((c) => (
                    <div key={c.id} className="text-sm text-white/90">
                        <span className="font-semibold">{c.author}</span>
                        <span className="mx-2 text-white/80">{c.text}</span>
                        <span className="text-xs text-white/40">{c.time}</span>
                    </div>
                ))}
            </div>
            <footer className="border-t border-white/10 p-3">
                <div className="flex items-center gap-2">
                    <input
                        aria-label="Yorum yaz"
                        placeholder="Yorum ekle (stub)"
                        className="w-full rounded bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50 outline-none"
                        disabled
                    />
                    <button className="rounded bg-white/10 px-3 py-2 text-sm text-white" disabled>
                        Gönder
                    </button>
                </div>
            </footer>
        </aside>
    );
}




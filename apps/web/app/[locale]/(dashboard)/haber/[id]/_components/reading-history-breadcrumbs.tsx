'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';

type HistoryItem = {
  id: string;
  title: string;
  category?: string | null;
  imageUrl?: string | null;
  visitedAt: number; // epoch ms
};

interface ReadingHistoryBreadcrumbsProps {
  readonly currentId: string;
  readonly currentTitle: string;
  readonly currentCategory?: string | null;
  readonly currentImageUrl?: string | null;
  readonly limit?: number; // how many to render
}

const STORAGE_KEY = 'nx_reading_history_v1';

function mergeIntoHistory(items: HistoryItem[], next: HistoryItem, maxCount: number): HistoryItem[] {
  const withoutCurrent = items.filter((x) => x.id !== next.id);
  const merged = [next, ...withoutCurrent];
  return merged.slice(0, maxCount);
}

export function ReadingHistoryBreadcrumbs({
  currentId,
  currentTitle,
  currentCategory,
  currentImageUrl,
  limit = 5,
}: ReadingHistoryBreadcrumbsProps) {
  const locale = useLocale();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      let parsed: HistoryItem[] = raw ? JSON.parse(raw) : [];
      const from = searchParams?.get('from');
      if (from === 'dashboard') {
        parsed = [];
      }
      const updated = mergeIntoHistory(parsed, {
        id: currentId,
        title: currentTitle,
        category: currentCategory ?? undefined,
        imageUrl: currentImageUrl ?? undefined,
        visitedAt: Date.now(),
      }, 20);
      setHistory(updated);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setHydrated(true);
    } catch {
      setHydrated(true);
    }
  }, [currentId, currentTitle, currentCategory, currentImageUrl, searchParams]);

  const handleClear = useCallback(() => {
    try {
      const kept = history.filter((h) => h.id === currentId);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
      setHistory(kept);
    } catch {}
  }, [history, currentId]);

  const recent = useMemo(() => history.filter((h) => h.id !== currentId).slice(0, limit), [history, currentId, limit]);

  if (!hydrated || recent.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 rounded-xl border border-white/5 bg-white/0 p-2 animate-[fadeIn_0.4s_ease-out]">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-white/60">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Son gezilenler</span>
        </div>
        <button
          aria-label="Geçmişi temizle"
          onClick={handleClear}
          className="rounded-md p-1 text-[10px] text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
        >
          ✕
        </button>
      </div>
      <HorizontalTimeline recent={recent} locale={locale} />
    </div>
  );
}

export default ReadingHistoryBreadcrumbs;

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'şimdi';
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.round(hours / 24);
  return `${days} gün önce`;
}

function HorizontalTimeline({ recent, locale }: { recent: HistoryItem[]; locale: string }) {
  return (
    <div className="relative py-1">
      {/* baseline */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/8" />
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hidden pr-1 snap-x snap-mandatory">
        {recent.map((item) => (
          <Link
            key={item.id}
            href={`/${locale}/haber/${item.id}`}
            title={item.title}
            className="group relative flex flex-col items-center gap-0.5 px-1.5 snap-start"
          >
            {/* dot */}
            <span className="relative z-[1] h-2 w-2 rounded-full bg-blue-400/80 ring-2 ring-white/15 transition-transform group-hover:scale-110" />
            {/* tiny label pill (single line) */}
            <span className="max-w-[200px] truncate rounded-full border border-white/8 bg-white/0 px-2 py-[2px] text-[11px] text-white/70 group-hover:bg-white/5 group-hover:text-white">
              {item.title}
            </span>
            {/* relative time under pill (very subtle) */}
            <span className="text-[10px] text-white/35 opacity-0 transition-opacity group-hover:opacity-100">{formatRelativeTime(item.visitedAt)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}



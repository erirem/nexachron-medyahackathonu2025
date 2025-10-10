"use client";

import Image from "next/image";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { addBookmark, removeBookmark } from "@/services/api";
import { useTrackEvent } from "@/hooks/use-track-event";

import type { DashboardNewsItem } from "./types";
import { SafeImage } from "./safe-image";

// Beyin ikonu - öneriler için
function BrainIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1 .34-4.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0-.34-4.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

const sentimentTone: Record<DashboardNewsItem["sentiment"], { readonly label: string; readonly badge: string; readonly dot: string }> = {
  positive: {
    label: "Pozitif ton",
    badge: "bg-[#e6f6eb] text-[#166a3b] border border-[#c6ebd3]",
    dot: "bg-[#22a45b]",
  },
  neutral: {
    label: "Dengeledi",
    badge: "bg-[#e9f0ff] text-[#1a4d84] border border-[#c9dbf7]",
    dot: "bg-[#3a7bd5]",
  },
  negative: {
    label: "Negatif baskı",
    badge: "bg-[#fde6ea] text-[#a2344d] border border-[#f4c7d2]",
    dot: "bg-[#d23b57]",
  },
};

const impactTone: Record<DashboardNewsItem["impact"], string> = {
  Yüksek: "bg-[#fff1df] text-[#b35300] border border-[#ffd8a8]",
  Orta: "bg-[#efe7ff] text-[#5b45b5] border border-[#d9c9ff]",
  Düşük: "bg-[#e3f5ff] text-[#1e6a96] border border-[#bfe6ff]",
};

type NewsCardProps = {
  readonly item: DashboardNewsItem;
  readonly isRecommended?: boolean;
  readonly isBreaking?: boolean;
};

export function NewsCard({ item, isRecommended = false, isBreaking = false }: NewsCardProps): JSX.Element {
  const sentiment = sentimentTone[item.sentiment];
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const track = useTrackEvent();

  useEffect(() => {
    // lightweight impression
    void track({ eventType: "view", itemId: String(item.id), metadata: { surface: "dashboard" } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-[#d5e1f3] bg-white/95 shadow-[0_22px_60px_rgba(21,61,125,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b9d2f2] hover:shadow-[0_30px_90px_rgba(21,61,125,0.12)]"
      onClick={() => {
        void track({ eventType: "click", itemId: String(item.id), metadata: { surface: "dashboard" } });
      }}
    >
      <figure className="relative h-40 w-full overflow-hidden">
        <SafeImage
          src={item.imageUrl}
          alt={item.title}
          sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 30vw, (min-width: 768px) 45vw, 80vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          priority={false}
        />
        <figcaption className="absolute inset-x-4 top-4 flex items-center justify-between rounded-full bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg">
          <span>{item.category}</span>
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[0.65rem] font-semibold text-[#1a2d45] shadow-sm">
            {item.timestamp}
          </span>
        </figcaption>
        
        {/* Öneri beyin ikonu - sağ üst köşe */}
        {isRecommended && (
          <div className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#0f6acd] to-[#1a8dff] text-white shadow-[0_4px_12px_rgba(15,106,205,0.4)]">
            <BrainIcon />
          </div>
        )}
      </figure>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-snug text-[#10233a] line-clamp-2">{item.title}</h3>
          <p className="text-sm leading-relaxed text-[#4a6182] line-clamp-3">{item.summary}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium text-[#3a5476]">
          {item.tags.map((tag) => (
            <span key={`${item.id}-${tag}`} className="rounded-full bg-[#eff4fb] px-3 py-1">
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-[#4a5f7c]">
            <span className="flex items-center gap-2 font-medium text-[#1b3354]">
              <LocationIcon />
              {item.dateline}
            </span>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] font-semibold ${sentiment.badge}`}>
              <span className={`h-2 w-2 rounded-full ${sentiment.dot}`} />
              {sentiment.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <ActionButton intent="primary" label="AI özet">
                <SparkleIcon />
              </ActionButton>
              <ActionButton label="Ses ile dinle">
                <WaveIcon />
              </ActionButton>
              <ActionButton
                label={saved ? "Kaydedildi" : "Kaydet"}
                onClick={async () => {
                  if (saving) return;
                  try {
                    setSaving(true);
                    if (!saved) {
                      await addBookmark(item.id);
                      setSaved(true);
                    } else {
                      await removeBookmark(item.id);
                      setSaved(false);
                    }
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <BookmarkIcon />
              </ActionButton>
            </div>

            <ImpactBadge impact={item.impact} />
          </div>
        </div>
      </div>
    </article>
  );
}

type ActionButtonProps = {
  readonly intent?: "primary" | "secondary";
  readonly label: string;
  readonly children: JSX.Element;
  readonly onClick?: () => void | Promise<void>;
};

function ActionButton({ intent = "secondary", label, children, onClick }: ActionButtonProps): JSX.Element {
  const baseClass =
    "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8bc4ff]";

  if (intent === "primary") {
    return (
      <button type="button" onClick={onClick} className={`${baseClass} bg-[#0f6acd] text-white shadow-[0_10px_26px_rgba(15,106,205,0.25)] hover:bg-[#135ec0]`}>
        {children}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${baseClass} border border-[#d2def1] bg-[#f6f9fe] text-[#1f3658] hover:bg-[#e9f1fd]`}>
      {children}
      <span>{label}</span>
    </button>
  );
}

type ImpactBadgeProps = {
  readonly impact: DashboardNewsItem["impact"];
};

function ImpactBadge({ impact }: ImpactBadgeProps): JSX.Element {
  const tone = impactTone[impact];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.7rem] font-semibold ${tone}`}>
      Etki: {impact}
    </span>
  );
}

function SparkleIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 1l1.2 3.6L13 6l-3.8 1.3L8 11l-1.2-3.7L3 6l3.8-1.4L8 1z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function WaveIcon(): JSX.Element {
  return (
    <svg width="16" height="14" viewBox="0 0 18 16" fill="none" aria-hidden>
      <path
        d="M1 8c2.5-4 5.5-4 8 0s5.5 4 8 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 8c1.3-2 2.7-2 4 0s2.7 2 4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}

function BookmarkIcon(): JSX.Element {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden>
      <path
        d="M3 1.5h6a1 1 0 011 1v9.6l-3.5-2.1L3 12.1V2.5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon(): JSX.Element {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden>
      <path
        d="M6 12s3-2.8 3-5.2A3 3 0 106 12z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="6.7" r="1.1" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

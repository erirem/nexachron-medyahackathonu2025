"use client";

import { useCallback, useEffect, useState, type ChangeEvent, type JSX } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { defaultLocale, localeLabels, locales, type Locale } from "@/i18n/locales";

export function LocaleSwitcher(): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resolvedLocale = useLocale();
  const locale = locales.includes(resolvedLocale as Locale)
    ? (resolvedLocale as Locale)
    : defaultLocale;
  const t = useTranslations("common.localeSwitcher");
  
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Set new timeout to hide after scrolling stops
      const newTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
      
      setScrollTimeout(newTimeout);
    };

    // Check if we're on a news page (has article-scroll-container)
    const articleContainer = document.getElementById('article-scroll-container');
    
    if (articleContainer) {
      // Listen to article container scroll
      articleContainer.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      // Listen to window scroll for other pages
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      if (articleContainer) {
        articleContainer.removeEventListener('scroll', handleScroll);
      } else {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scrollTimeout]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextLocale = event.currentTarget.value as Locale;

      if (nextLocale === locale) {
        return;
      }

      const segments = pathname.split("/");

      if (segments.length > 1) {
        segments[1] = nextLocale;
      } else {
        segments.push(nextLocale);
      }

      const nextPath = segments.join("/") || `/${nextLocale}`;
      const query = searchParams.toString();
      const target = query ? `${nextPath}?${query}` : nextPath;

      router.replace(target);
    },
    [locale, pathname, router, searchParams],
  );

  return (
    <div
      className={`pointer-events-none fixed left-4 right-4 z-50 flex justify-end transition-opacity duration-300 ${
        isScrolling ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        top: "calc(env(safe-area-inset-top, 0px) + 1rem)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      <div className="pointer-events-auto inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-[#020817]/70 px-3 py-1.5 text-xs text-white backdrop-blur-md shadow-lg shadow-black/20">
        <label htmlFor="locale-switcher" className="uppercase tracking-[0.3em] text-[10px] text-white/60 whitespace-nowrap shrink-0">
          {t("label")}
        </label>
        <select
          id="locale-switcher"
          className="min-w-0 flex-1 max-w-[120px] rounded-full border border-white/20 bg-transparent px-3 py-1 text-xs font-semibold text-white outline-none transition hover:border-white/40 truncate"
          value={locale}
          onChange={handleChange}
        >
          {locales.map((code) => (
            <option key={code} value={code} className="text-[#020817]">
              {localeLabels[code]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

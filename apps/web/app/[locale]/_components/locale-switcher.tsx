"use client";

import { useCallback, type ChangeEvent, type JSX } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { localeLabels, locales, type Locale } from "@/i18n/locales";

export function LocaleSwitcher(): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale() as Locale;
  const t = useTranslations("common.localeSwitcher");

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
    <div className="pointer-events-auto fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-[#020817]/70 px-3 py-1.5 text-xs text-white backdrop-blur-md shadow-lg shadow-black/20">
      <label htmlFor="locale-switcher" className="uppercase tracking-[0.3em] text-[10px] text-white/60">
        {t("label")}
      </label>
      <select
        id="locale-switcher"
        className="rounded-full border border-white/20 bg-transparent px-3 py-1 text-xs font-semibold text-white outline-none transition hover:border-white/40"
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
  );
}

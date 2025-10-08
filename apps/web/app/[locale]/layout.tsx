import type { ReactNode } from "react";
import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";

import { locales } from "@/i18n/locales";
import { GamificationProvider } from "@/contexts/gamification-context";
import { ReactQueryProvider } from "@/contexts/react-query-provider";

import { LocaleSwitcher } from "./_components/locale-switcher";

type LayoutProps = {
  readonly children: ReactNode;
  readonly params: Promise<{ readonly locale: string }>;
};

export function generateStaticParams(): Array<{ locale: string }> {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps) {
  const { locale } = await params;

  unstable_setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <GamificationProvider>
        <ReactQueryProvider>
          <div className="sticky top-0 z-40 flex items-center justify-between gap-4 bg-black/80 px-4 py-2 text-white backdrop-blur">
            <LocaleSwitcher />
            <nav className="flex items-center gap-3 text-sm">
              <Link href={`/${locale}/explore`} className="rounded px-2 py-1 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white">
                Reels
              </Link>
            </nav>
          </div>
          {children}
        </ReactQueryProvider>
      </GamificationProvider>
    </NextIntlClientProvider>
  );
}

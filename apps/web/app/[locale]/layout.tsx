import type { ReactNode } from "react";
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
          <LocaleSwitcher />
          {children}
        </ReactQueryProvider>
      </GamificationProvider>
    </NextIntlClientProvider>
  );
}

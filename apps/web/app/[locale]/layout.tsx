import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";

import { locales } from "@/i18n/locales";
import { GamificationProvider } from "@/contexts/gamification-context";
import { ReactQueryProvider } from "@/contexts/react-query-provider";
import { NewsTrackingProvider } from "@/contexts/news-tracking-context";
import { PersonalAnalystProvider } from "@/contexts/personal-analyst-context";
import { AuthProvider } from "@/contexts/auth-context";
import { OnboardingGuard } from "@/components/auth/onboarding-guard";


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
      <AuthProvider>
        <GamificationProvider>
          <NewsTrackingProvider>
            <PersonalAnalystProvider>
              <ReactQueryProvider>
                <OnboardingGuard>
                  {children}
                </OnboardingGuard>
              </ReactQueryProvider>
            </PersonalAnalystProvider>
          </NewsTrackingProvider>
        </GamificationProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

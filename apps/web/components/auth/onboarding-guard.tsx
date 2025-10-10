"use client";

import { useEffect } from 'react';
import { useAuthState } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const AUTH_REQUIRED_ROUTES = ['/dashboard', '/haber', '/quizzes', '/leaderboard', '/profil'];
const ONBOARDING_ROUTE = '/onboarding';
const AUTH_ROUTES = ['/login', '/register'];

function normalizePath(pathname: string | null): string {
  if (!pathname) return '/';
  const segments = pathname.split('/').slice(2);
  return segments.length ? `/${segments.join('/')}` : '/';
}

function pathMatches(path: string, route: string): boolean {
  if (path === route) return true;
  return path.startsWith(`${route}/`);
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const {
    user,
    loading,
    onboardingStatusLoading,
    hasCompletedOnboarding,
    isFirstTimeUser,
  } = useAuthState();

  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split('/')?.[1] || 'tr';
  const normalized = normalizePath(pathname);

  // Auth hazır mı? Onboarding sorgusu gecikse bile UI'yi kilitlemeyelim.
  const authReady = !loading;
  const isOnboardingPage = pathMatches(normalized, ONBOARDING_ROUTE);
  const needsAuth = AUTH_REQUIRED_ROUTES.some((route) => pathMatches(normalized, route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathMatches(normalized, route));

  useEffect(() => {
    if (!pathname) return;

    // Sadece auth hazır olduğunda yönlendirme yapalım
    if (!authReady) return;

    if (!user && needsAuth) {
      router.replace(`/${locale}/login`);
      return;
    }

    if (!user) {
      return;
    }

    if (hasCompletedOnboarding === true && isOnboardingPage) {
      router.replace(`/${locale}/dashboard`);
      return;
    }

    if ((hasCompletedOnboarding === false || isFirstTimeUser === true) && !isOnboardingPage && !isAuthRoute) {
      router.replace(`/${locale}/onboarding`);
    }
  }, [
    authReady,
    user,
    needsAuth,
    isOnboardingPage,
    hasCompletedOnboarding,
    isFirstTimeUser,
    pathname,
    locale,
    router,
    isAuthRoute,
  ]);

  const shouldBlock =
    !pathname ||
    // Sadece auth yüklenirken bekle
    !authReady ||
    // Korumalı route ve kullanıcı yoksa beklet (redirect hemen yapılacak)
    (user === null && needsAuth) ||
    // Onboarding'i tamamlayan kullanıcı onboarding sayfasına düşerse engelle
    (user !== null && hasCompletedOnboarding === true && isOnboardingPage) ||
    // Onboarding gerekli ise engelle
    (user !== null && (hasCompletedOnboarding === false || isFirstTimeUser === true) && !isOnboardingPage && !isAuthRoute);

  if (shouldBlock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto animate-spin-slow"></div>
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">Hoş geldiniz</p>
          <p className="text-sm text-gray-500">Tercihleriniz hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

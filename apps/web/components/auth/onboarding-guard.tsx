"use client";

import { useEffect, useState } from 'react';
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

    // Onboarding kontrolü - sadece kesin olarak false ise onboarding'e yönlendir
    if (hasCompletedOnboarding === false && !isOnboardingPage && !isAuthRoute) {
      router.replace(`/${locale}/onboarding`);
      return;
    }
    
    // Eğer onboarding durumu null ise (API'den veri gelmiyorsa) ve dashboard'a gitmeye çalışıyorsa, dashboard'a izin ver
    if (hasCompletedOnboarding === null && !isOnboardingPage && !isAuthRoute && needsAuth) {
      // Dashboard'a gitmeye çalışıyor ve onboarding durumu bilinmiyor - dashboard'a izin ver
      return;
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

  const shouldShowLoadingOverlay =
    !pathname ||
    // Auth yüklenirken overlay göster
    !authReady ||
    // Onboarding durumu yüklenirken overlay göster
    onboardingStatusLoading;

  return (
    <>
      {shouldShowLoadingOverlay && <LoadingOverlay />}
      {children}
    </>
  );
}

function LoadingOverlay(): JSX.Element {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden />
      <div className="relative pointer-events-auto mx-4 max-w-md rounded-2xl border border-white/20 bg-gradient-to-br from-[#0f2847]/95 via-[#1a3a5c]/95 to-[#0c1e3a]/95 px-8 py-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center gap-5">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-[#0f6acd] to-[#1a8dff] opacity-60" aria-hidden />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#0f6acd] to-[#1a8dff] shadow-[0_12px_40px_rgba(15,106,205,0.45)]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="animate-spin">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="15" opacity="0.25" />
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="45" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">Yükleniyor{dots}</div>
            <p className="mt-1 text-sm text-white/70">Kişiselleştirilmiş deneyiminiz hazırlanıyor</p>
          </div>
        </div>
      </div>
    </div>
  );
}

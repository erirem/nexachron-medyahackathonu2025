"use client";

import { useEffect } from 'react';
import { useAuthState } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { user, loading, onboardingStatusLoading, hasCompletedOnboarding } = useAuthState();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading || onboardingStatusLoading) {
      return;
    }

    // If hasCompletedOnboarding is still null after loading, it means API is not available
    // In this case, we should show the landing page
    if (hasCompletedOnboarding === null && !user) {
      console.log('HomePage: API not available, showing landing page');
      return;
    }

    // If user is logged in and has completed onboarding, redirect to dashboard
    if (user && hasCompletedOnboarding === true) {
      const locale = pathname?.split('/')[1] || 'tr';
      router.push(`/${locale}/dashboard`);
      return;
    }

    // If user is logged in but hasn't completed onboarding, redirect to onboarding
    if (user && hasCompletedOnboarding === false) {
      const locale = pathname?.split('/')[1] || 'tr';
      router.push(`/${locale}/onboarding`);
      return;
    }
  }, [user, loading, onboardingStatusLoading, hasCompletedOnboarding, router, pathname]);

  // Show loading state only while auth is loading
  if (loading || onboardingStatusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto animate-spin-slow"></div>
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">Hoş geldiniz</p>
          <p className="text-sm text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, don't show landing page (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051937] via-[#0a2f5a] to-[#144f92] text-white">
      {/* Background Animations */}
      <div className="animate-gradient absolute inset-0 -z-10 opacity-70" aria-hidden />
      <div
        className="absolute inset-x-0 top-0 -z-10 h-60 md:h-80 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_60%)]"
        aria-hidden
      />
      <div
        className="animate-pulse-slow absolute -right-10 md:-right-24 top-10 md:top-20 -z-10 h-64 w-64 md:h-96 md:w-96 rounded-full bg-[conic-gradient(from_90deg_at_50%_50%,rgba(110,167,255,0.25),rgba(6,20,56,0.12),rgba(167,212,255,0.3))] blur-3xl"
        aria-hidden
      />
      <div
        className="animate-pulse-slower absolute -left-10 md:-left-20 bottom-4 md:bottom-8 -z-10 h-72 w-72 md:h-[28rem] md:w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(12,48,95,0.55),rgba(8,24,48,0.2))] blur-3xl"
        aria-hidden
      />

      <main className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-6 md:gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10 xl:gap-12">
          {/* Hero Section */}
          <div className="flex flex-col justify-center gap-6 md:gap-8 text-white">
            <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.35em] sm:tracking-[0.45em] text-[#a5d8ff]/90 animate-fade-in">
              <span className="hero-accent-line h-[1px] w-6 sm:w-9" aria-hidden /> 
              Nexachron
            </span>
            
            <div className="space-y-3 md:space-y-5">
              <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-semibold leading-tight animate-fade-up">
                <span className="text-glow-gradient">Türkiye'nin</span> en güncel haberlerini keşfedin
              </h1>
              <p className="max-w-xl text-sm sm:text-base leading-6 sm:leading-7 text-white/70 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                AI destekli kişiselleştirilmiş haber deneyimi ile güncel kalın. 
                Oyunlaştırılmış özellikler ve kişisel tercihlerinize göre düzenlenmiş içerikler.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link
                className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-all duration-500 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15"
                href="/tr/register"
              >
                Hemen Başla
                <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                className="group flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white/70 backdrop-blur-xl hover:border-white/30 transition-all duration-300"
                href="/tr/login"
              >
                Giriş Yap
              </Link>
            </div>
            
            <ul className="mt-4 md:mt-6 lg:mt-8 grid gap-3 sm:gap-4 sm:grid-cols-2 max-w-xl lg:max-w-[560px]">
              <li className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-3 sm:p-4 lg:p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#7dcfff]/60 hover:bg-white/10 hover:shadow-[0_20px_40px_rgba(125,207,255,0.15)] animate-stagger">
                <span className="text-lg sm:text-xl inline-block group-hover:animate-wave" aria-hidden>🤖</span>
                <h2 className="mt-2 sm:mt-3 text-sm sm:text-base font-semibold text-white">AI Destekli</h2>
                <p className="mt-1 text-xs sm:text-sm leading-5 text-white/70">Kişiselleştirilmiş haber önerileri</p>
              </li>
              <li className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-3 sm:p-4 lg:p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#7dcfff]/60 hover:bg-white/10 hover:shadow-[0_20px_40px_rgba(125,207,255,0.15)] animate-stagger" style={{ animationDelay: '0.1s' }}>
                <span className="text-lg sm:text-xl inline-block group-hover:animate-wave" aria-hidden>🎮</span>
                <h2 className="mt-2 sm:mt-3 text-sm sm:text-base font-semibold text-white">Oyunlaştırma</h2>
                <p className="mt-1 text-xs sm:text-sm leading-5 text-white/70">Puan kazanın ve seviye atlayın</p>
              </li>
              <li className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-3 sm:p-4 lg:p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#7dcfff]/60 hover:bg-white/10 hover:shadow-[0_20px_40px_rgba(125,207,255,0.15)] animate-stagger" style={{ animationDelay: '0.2s' }}>
                <span className="text-lg sm:text-xl inline-block group-hover:animate-wave" aria-hidden>⚡</span>
                <h2 className="mt-2 sm:mt-3 text-sm sm:text-base font-semibold text-white">Hızlı</h2>
                <p className="mt-1 text-xs sm:text-sm leading-5 text-white/70">Anında güncel haberler</p>
              </li>
              <li className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-3 sm:p-4 lg:p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#7dcfff]/60 hover:bg-white/10 hover:shadow-[0_20px_40px_rgba(125,207,255,0.15)] animate-stagger" style={{ animationDelay: '0.3s' }}>
                <span className="text-lg sm:text-xl inline-block group-hover:animate-wave" aria-hidden>🎯</span>
                <h2 className="mt-2 sm:mt-3 text-sm sm:text-base font-semibold text-white">Kişisel</h2>
                <p className="mt-1 text-xs sm:text-sm leading-5 text-white/70">Size özel içerikler</p>
              </li>
            </ul>
          </div>

          {/* CTA Panel */}
          <div className="relative mx-auto w-full max-w-[420px] lg:mx-0 lg:justify-self-center xl:justify-self-end">
            <div className="absolute inset-0 -z-10 rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] bg-white/5 blur-3xl" aria-hidden />
            
            <div className="relative group">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[-72px] sm:inset-[-84px] lg:inset-[-96px] z-[5] rounded-[2.5rem] bg-[#0b2546]/20 opacity-0 transition-all duration-500 ease-out backdrop-blur-none group-hover:opacity-90 group-hover:backdrop-blur-2xl group-hover:bg-[#0b2546]/35"
              />
              <div className="relative z-10 rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] border border-white/15 bg-white/10 p-6 sm:p-7 lg:p-8 shadow-[0_40px_120px_rgba(5,25,55,0.55)] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_50px_140px_rgba(125,207,255,0.25)] hover:border-white/20 overflow-hidden">
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#7dcfff]/20 blur-3xl animate-pulse-slow" aria-hidden />
                <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#5bb5f0]/20 blur-3xl animate-pulse-slower" aria-hidden />
                
                <div className="relative">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 mb-4">
                    <h2 className="text-lg sm:text-xl lg:text-[22px] font-semibold text-white animate-fade-in">
                      Hemen Başlayın
                    </h2>
                    <span className="inline-flex w-fit rounded-full bg-gradient-to-r from-[#133c66] to-[#1a4a7a] px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-[#a5d8ff] shadow-sm animate-glow">
                      Ücretsiz
                    </span>
                  </div>
                  <p className="text-[13px] sm:text-sm leading-5 sm:leading-6 text-white/70 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    Hesap oluşturun ve kişiselleştirilmiş haber deneyiminin keyfini çıkarın
                  </p>
                  
                  <div className="mt-6 space-y-3">
                    <Link
                      href="/tr/register"
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7dcfff] to-[#5bb5f0] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                    >
                      Hesap Oluştur
                    </Link>
                    <Link
                      href="/tr/login"
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/30"
                    >
                      Giriş Yap
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect } from 'react';
import { useAuthState } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { RegisterLanding } from '../_components/register-landing';

export default function RegisterPage() {
  const { user, loading, onboardingStatusLoading, hasCompletedOnboarding } = useAuthState();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading || onboardingStatusLoading) {
      return;
    }

    // If hasCompletedOnboarding is still null after loading, it means API is not available
    // In this case, we should show the register form
    if (hasCompletedOnboarding === null && !user) {
      console.log('RegisterPage: API not available, showing register form');
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

  // If user is logged in, don't show register page (will redirect)
  if (user) {
    return null;
  }

  return <RegisterLanding />;
}

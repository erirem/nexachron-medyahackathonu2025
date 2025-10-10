"use client";

import { useEffect } from 'react';
import { useAuthState } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { PreferencesOnboarding } from './_components/preferences-onboarding';
import { useLocale } from 'next-intl';

export default function OnboardingPage() {
  const {
    user,
    loading,
    onboardingStatusLoading,
    hasCompletedOnboarding,
    isFirstTimeUser,
    checkOnboardingStatus,
    markOnboardingComplete,
  } = useAuthState();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    console.log('OnboardingPage: Effect triggered', {
      loading,
      onboardingStatusLoading,
      user: !!user,
      hasCompletedOnboarding,
      isFirstTimeUser
    });

    // Wait for auth to finish loading
    if (loading || onboardingStatusLoading) {
      console.log('OnboardingPage: Still loading, waiting...');
      return;
    }

    // Check if user is logged in
    if (!user) {
      console.log('OnboardingPage: No user, redirecting to login');
      router.replace(`/${locale}/login`);
      return;
    }

    // If user has already completed onboarding, redirect to dashboard
    if (hasCompletedOnboarding === true) {
      console.log('OnboardingPage: User has completed onboarding, redirecting to dashboard');
      router.replace(`/${locale}/dashboard`);
      return;
    }

    // If user is not a first time user but somehow ended up here, redirect to dashboard
    if (isFirstTimeUser === false) {
      console.log('OnboardingPage: Not a first time user, redirecting to dashboard');
      router.replace(`/${locale}/dashboard`);
      return;
    }

    // If API is not available (null values), show onboarding form anyway for safety
    if (hasCompletedOnboarding === null && isFirstTimeUser === null) {
      console.log('OnboardingPage: API not available, showing onboarding form as fallback');
      return;
    }

    // If we reach here, user is first time and needs onboarding
    console.log('OnboardingPage: First time user, showing onboarding form');
  }, [
    user,
    loading,
    onboardingStatusLoading,
    hasCompletedOnboarding,
    isFirstTimeUser,
    router,
    locale,
  ]);

  const handleOnboardingComplete = async () => {
    console.log('handleOnboardingComplete called, starting redirect process...');
    
    try {
      // Refresh onboarding status to confirm persisted state
      console.log('Refreshing onboarding status...');
      let isCompleted = await checkOnboardingStatus();
      console.log('Onboarding status after refresh:', isCompleted);

      if (!isCompleted) {
        console.log('Onboarding status not yet updated, retrying...');
        await new Promise((resolve) => setTimeout(resolve, 400));
        isCompleted = await checkOnboardingStatus();
        console.log('Onboarding status after retry:', isCompleted);
      }

      if (isCompleted) {
        markOnboardingComplete();
      } else {
        console.warn('Onboarding status still pending after retry; marking as complete optimistically.');
        markOnboardingComplete();
      }
      
      // Force redirect to dashboard
      console.log('Redirecting to dashboard...');
      router.replace(`/${locale}/dashboard`);
    } catch (error) {
      console.error('Error in handleOnboardingComplete:', error);
      // Fallback redirect
      console.log('Fallback redirect to dashboard...');
      router.replace(`/${locale}/dashboard`);
    }
  };

  // Show loading state only while auth is loading
  if (loading || onboardingStatusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, don't show onboarding page (will redirect)
  if (!user) {
    return null;
  }

  return <PreferencesOnboarding onComplete={handleOnboardingComplete} />;
}

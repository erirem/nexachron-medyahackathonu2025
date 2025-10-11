"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  onboardingStatusLoading: boolean;
  hasCompletedOnboarding: boolean | null;
  isFirstTimeUser: boolean | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkOnboardingStatus: () => Promise<boolean>;
  markOnboardingComplete: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingStatusLoading, setOnboardingStatusLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean | null>(null);

  // Function to check onboarding status
  const checkOnboardingStatus = useCallback(async (): Promise<boolean> => {
    try {
      setOnboardingStatusLoading(true);
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        // No session, so we can't check - user is not logged in
        console.log('AuthContext: No session found, setting states to null');
        setHasCompletedOnboarding(null);
        setIsFirstTimeUser(null);
        setOnboardingStatusLoading(false);
        return false;
      }
      
      console.log('AuthContext: Checking onboarding status for user:', session.user?.id);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(`${API_URL}/api/v1/user-data/preferences`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          const completedFromMeta = data?.meta?.hasCompletedOnboarding;
          const firstTimeFromMeta = data?.meta?.isFirstTimeUser;
          const completed =
            typeof completedFromMeta === 'boolean'
              ? completedFromMeta
              : !!(data.data && data.data.personalization_opt_in);
          const firstTime =
            typeof firstTimeFromMeta === 'boolean' ? firstTimeFromMeta : !completed;

          console.log('AuthContext: Onboarding status:', completed, 'Data:', data);
          setHasCompletedOnboarding(completed);
          setIsFirstTimeUser(firstTime);
          setOnboardingStatusLoading(false);
          return completed;
        }
        
        // API call failed or returned error - treat as unknown so UI can retry gracefully
        console.log('AuthContext: API call failed, status:', response.status, 'returning unknown onboarding state');
        setHasCompletedOnboarding(null);
        setIsFirstTimeUser(null);
        setOnboardingStatusLoading(false);
        return false;
      } catch (fetchError) {
        clearTimeout(timeoutId);

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.log('AuthContext: API call timed out, assuming onboarding not completed');
        } else {
          console.log('AuthContext: API call failed with error:', fetchError);
        }
        
        // If API is not available, keep state unknown so guard can fallback gracefully
        setHasCompletedOnboarding(null);
        setIsFirstTimeUser(null);
        setOnboardingStatusLoading(false);
        return false;
      }
    } catch (error) {
      console.error('AuthContext: Error checking onboarding status:', error);
      setHasCompletedOnboarding(null);
      setIsFirstTimeUser(null);
      setOnboardingStatusLoading(false);
      return false;
    }
  }, []);

  const markOnboardingComplete = useCallback(() => {
    setHasCompletedOnboarding(true);
    setIsFirstTimeUser(false);
    setOnboardingStatusLoading(false);
  }, []);

  // Function to load user profile
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('AuthContext: Loading profile for user:', userId);
      const supabase = getSupabaseClient();
      
      // Fetch both auth user and session token
      const [authResult, sessionResult] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.getSession(),
      ]);

      if (authResult.error) {
        console.error('Error getting auth user:', authResult.error);
        return null;
      }

      const session = sessionResult.data.session;
      const authUser = authResult.data.user;

      if (!authUser) {
        console.error('No user found in auth');
        return null;
      }

      // Ensure a matching profile row exists via API (idempotent call)
      if (session?.access_token) {
        try {
          const ensureResponse = await fetch(`${API_URL}/api/me`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!ensureResponse.ok) {
            console.warn('AuthContext: Failed to ensure profile row, status:', ensureResponse.status);
          }
        } catch (ensureError) {
          console.warn('AuthContext: Error ensuring profile row:', ensureError);
        }
      }

      // Try to get additional profile data from users table
      let profileData = null;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name, username, avatar_url, created_at')
          .eq('id', userId)
          .single();

        if (!error) {
          profileData = data;
        } else {
          console.log('Users table not accessible, using auth data only:', error.message);
          // Don't throw error, just continue with auth data
        }
      } catch (tableError) {
        console.log('Users table not found, using auth data only:', tableError);
        // Don't throw error, just continue with auth data
      }

      const userProfile: UserProfile = {
        id: authUser.id,
        email: authUser.email || '',
        first_name: profileData?.first_name || authUser.user_metadata?.first_name || null,
        last_name: profileData?.last_name || authUser.user_metadata?.last_name || null,
        full_name: (() => {
          const firstName = profileData?.first_name || authUser.user_metadata?.first_name;
          const lastName = profileData?.last_name || authUser.user_metadata?.last_name;
          if (firstName && lastName) return `${firstName} ${lastName}`;
          return firstName || lastName || 'Kullanıcı';
        })(),
        avatar_url: profileData?.avatar_url || authUser.user_metadata?.avatar_url || null,
        username: profileData?.username || authUser.user_metadata?.username || null,
        created_at: profileData?.created_at || authUser.created_at,
      };

      console.log('AuthContext: Profile loaded successfully:', userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      return null;
    }
  }, []);

  // Function to refresh profile
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const userProfile = await loadUserProfile(user.id);
      setProfile(userProfile);
      await checkOnboardingStatus();
    }
  }, [user?.id, loadUserProfile, checkOnboardingStatus]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let isMounted = true;
    // Yükleme watchdog: beklenmeyen gecikmelerde UI'nin kilitlenmesini önle
    const loadingWatchdog = setTimeout(() => {
      if (!isMounted) return;
      if (loading) {
        console.warn('AuthContext: loading watchdog triggered, forcing ready state');
        setLoading(false);
      }
      if (onboardingStatusLoading) {
        setOnboardingStatusLoading(false);
      }
    }, 4000);

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        setUser(session?.user ?? null);
        
        // Load profile if user exists
        if (session?.user?.id) {
          console.log('AuthContext: User found, loading profile and checking onboarding');
          const userProfile = await loadUserProfile(session.user.id);
          if (isMounted) {
            setProfile(userProfile);
            await checkOnboardingStatus();
          }
        } else {
          console.log('AuthContext: No user found in session');
          if (isMounted) {
            setHasCompletedOnboarding(null);
            setIsFirstTimeUser(null);
            setOnboardingStatusLoading(false);
          }
        }
      } catch (error) {
        console.error('AuthContext: Error in getInitialSession:', error);
        if (isMounted) {
          setHasCompletedOnboarding(null);
          setIsFirstTimeUser(null);
          setOnboardingStatusLoading(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('AuthContext: Initial session load complete');
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('AuthContext: Auth state changed, event:', event);
          
          if (!isMounted) return;
          
          setUser(session?.user ?? null);
          
          // Load profile if user exists
          if (session?.user?.id) {
            console.log('AuthContext: Loading profile after auth change');
            const userProfile = await loadUserProfile(session.user.id);
            if (isMounted) {
              setProfile(userProfile);
              await checkOnboardingStatus();
            }
          } else {
            console.log('AuthContext: User logged out, clearing profile');
            if (isMounted) {
              setProfile(null);
              setHasCompletedOnboarding(null);
              setIsFirstTimeUser(null);
              setOnboardingStatusLoading(false);
            }
          }
        } catch (error) {
          console.error('AuthContext: Error in auth state change:', error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(loadingWatchdog);
    };
  }, [loadUserProfile, checkOnboardingStatus]); // Include the memoized functions

  const signOut = async () => {
    try {
      console.log('AuthContext: signOut başlatılıyor...');
      
      // Önce state'i temizle ki UI hemen güncellensin
      setUser(null);
      setProfile(null);
      setHasCompletedOnboarding(null);
      setIsFirstTimeUser(null);
      setOnboardingStatusLoading(false);
      
      const persistent = getSupabaseClient(true);
      const sessionClient = getSupabaseClient(false);

      // Supabase JS v2 signOut opsiyonel scope destekliyor; tip uyuşmazlığı durumunda parametresiz çağrıya düşeriz
      const signOutWithScope = async (client: ReturnType<typeof getSupabaseClient>) => {
        try {
          // @ts-ignore - bazı tip sürümlerinde scope eksik olabilir
          await client.auth.signOut({ scope: 'global' });
          console.log('AuthContext: Global signOut başarılı');
        } catch (error) {
          console.log('AuthContext: Global signOut başarısız, normal signOut deneniyor:', error);
          await client.auth.signOut();
          console.log('AuthContext: Normal signOut başarılı');
        }
      };

      const results = await Promise.allSettled([
        signOutWithScope(persistent),
        signOutWithScope(sessionClient),
      ]);

      // Sonuçları kontrol et
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`AuthContext: Client ${index} signOut hatası:`, result.reason);
        }
      });

      console.log('AuthContext: Tüm signOut işlemleri tamamlandı');
    } catch (e) {
      console.error('AuthContext: signOut sırasında kritik hata:', e);
      // Hata olsa bile state'i temizle
      setUser(null);
      setProfile(null);
      setHasCompletedOnboarding(null);
      setIsFirstTimeUser(null);
      setOnboardingStatusLoading(false);
    } finally {
      // LocalStorage'ı da temizle
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token');
          // Supabase auth token'larını temizle
          Object.keys(localStorage).forEach(key => {
            if (key.includes('supabase') || key.includes('sb-')) {
              localStorage.removeItem(key);
            }
          });
          console.log('AuthContext: LocalStorage temizlendi');
        }
      } catch (storageError) {
        console.warn('AuthContext: LocalStorage temizleme hatası:', storageError);
      }
      
      console.log('AuthContext: SignOut tamamlandı');
    }
  };

  const value = {
    user,
    profile,
    loading,
    onboardingStatusLoading,
    hasCompletedOnboarding,
    isFirstTimeUser,
    signOut,
    refreshProfile,
    checkOnboardingStatus,
    markOnboardingComplete,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Alias for compatibility
export const useUser = () => {
  const { user } = useAuth();
  return user;
};

export const useProfile = () => {
  const { profile } = useAuth();
  return profile;
};

// Hook that includes loading state
export const useAuthState = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
};

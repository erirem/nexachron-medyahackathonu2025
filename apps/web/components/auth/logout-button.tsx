"use client";

import { useCallback, useState, type JSX } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

import { useAuth } from "@/contexts/auth-context";

interface LogoutButtonProps {
  readonly className?: string;
  readonly label?: string;
}

export function LogoutButton(props: LogoutButtonProps): JSX.Element {
  const { className, label = "Çıkış Yap" } = props;
  const { signOut } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    if (isLoading) return; // Prevent multiple clicks
    
    setIsLoading(true);
    try {
      console.log('Logout başlatılıyor...');
      
      await signOut();
      console.log('SignOut tamamlandı, login sayfasına yönlendiriliyor...');
      
      // Sayfayı yenile ve login'e yönlendir
      window.location.href = `/${locale}/login`;
    } catch (error) {
      console.error('Logout hatası:', error);
      // Hata olsa bile login sayfasına yönlendir
      window.location.href = `/${locale}/login`;
    } finally {
      setIsLoading(false);
    }
  }, [signOut, locale, isLoading]);

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full bg-gray-900/80 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      }
    >
      {isLoading ? "Çıkış yapılıyor..." : label}
    </button>
  );
}



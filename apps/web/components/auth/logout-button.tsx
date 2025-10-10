"use client";

import { useCallback, type JSX } from "react";
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

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } finally {
      router.replace(`/${locale}/login`);
    }
  }, [signOut, router, locale]);

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full bg-gray-900/80 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 transition-colors"
      }
    >
      {label}
    </button>
  );
}



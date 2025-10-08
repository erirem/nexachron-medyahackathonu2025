"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LocaleSwitcher } from "../_components/locale-switcher";

type Props = {
  readonly locale: string;
};

export function TopBar({ locale }: Props): JSX.Element {
  const pathname = usePathname();
  const showReels = pathname?.includes(`/${locale}/explore`) || pathname?.includes(`/${locale}/reel/`);

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between gap-4 bg-black/80 px-4 py-2 text-white backdrop-blur">
      <LocaleSwitcher />
      {showReels && (
        <nav className="flex items-center gap-3 text-sm">
          <Link href={`/${locale}/explore`} className="rounded px-2 py-1 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white">
            Reels
          </Link>
        </nav>
      )}
    </div>
  );
}



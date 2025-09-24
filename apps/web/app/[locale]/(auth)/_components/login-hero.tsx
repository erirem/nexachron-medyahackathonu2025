import type { JSX } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

type HighlightMessage = {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
};

interface LoginHeroProps {
  readonly className?: string;
}

export function LoginHero({ className }: LoginHeroProps): JSX.Element {
  const baseClassName = "flex flex-col justify-center gap-6 md:gap-8 text-white";
  const sectionClassName = className ? `${baseClassName} ${className}` : baseClassName;
  const locale = useLocale();
  const t = useTranslations("login.hero");
  const highlights = t.raw("highlights") as HighlightMessage[];

  return (
    <section className={sectionClassName}>
      <span className="inline-flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.1em] sm:tracking-[0.35em] text-[#a5d8ff]/90 animate-fade-in max-w-full overflow-hidden">
        <span className="hero-accent-line h-[1px] w-4 sm:w-9 shrink-0" aria-hidden /> 
        <span className="truncate whitespace-nowrap">{t("badge")}</span>
      </span>
      <div className="space-y-3 md:space-y-5">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-semibold leading-tight animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          {t.rich("title", {
            highlight: (chunks) => <span className="text-glow-gradient">{chunks}</span>,
          })}
        </h1>
        <p
          className="max-w-xl text-sm sm:text-base leading-6 sm:leading-7 text-white/70 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          {t("description")}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <Link
          className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-white to-[#f0f9ff] px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#0a2141] shadow-lg shadow-black/10 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(125,207,255,0.3)] hover:from-[#dff2ff] hover:to-white active:scale-95"
          href={`/${locale}/register`}
        >
          {t("ctaPrimary")}
          <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
        </Link>
        <span className="flex items-center gap-2 sm:gap-3 rounded-full border border-white/20 bg-gradient-to-r from-white/10 to-white/5 px-4 sm:px-5 py-2.5 sm:py-3 text-[10px] sm:text-xs font-medium text-white/70 backdrop-blur-xl hover:border-white/30 transition-all duration-300 hover:scale-105">
          <span className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-gradient-to-r from-[#1a3b68] to-[#2a4b78] text-[#a5d8ff] animate-bounce">
            {t("ctaBonus")}
          </span>
          {t("ctaSecondary")}
        </span>
      </div>
      <ul className="mt-4 md:mt-6 lg:mt-8 grid gap-3 sm:gap-4 sm:grid-cols-2 max-w-xl lg:max-w-[560px]">
        {highlights.map((highlight, index) => (
          <li
            key={highlight.title}
            className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-3 sm:p-4 lg:p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#7dcfff]/60 hover:bg-white/10 hover:shadow-[0_20px_40px_rgba(125,207,255,0.15)] animate-stagger"
            style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
          >
            {/* Background decoration */}
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[#7dcfff]/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden />
            
            <span className="text-lg sm:text-xl inline-block group-hover:animate-wave" aria-hidden>
              {highlight.icon}
            </span>
            <h2 className="mt-2 sm:mt-3 text-sm sm:text-base font-semibold text-white">{highlight.title}</h2>
            <p className="mt-1 text-xs sm:text-sm leading-5 text-white/70">{highlight.description}</p>
            
            {/* Interactive hover effect */}
            <span className="pointer-events-none absolute bottom-0 right-0 size-20 sm:size-24 translate-x-16 translate-y-16 rounded-full bg-[radial-gradient(circle,rgba(125,207,255,0.35),transparent_60%)] opacity-0 transition-all duration-700 group-hover:translate-x-6 group-hover:translate-y-6 group-hover:opacity-100" />
            
            {/* Progress indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#7dcfff] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </li>
        ))}
      </ul>
    </section>
  );
}

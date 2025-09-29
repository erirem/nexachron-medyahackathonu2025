import type { JSX } from "react";
import { useMemo } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { RegisterForm } from "./register-form";

export function RegisterLanding(): JSX.Element {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#051937] via-[#0a2f5a] to-[#144f92] text-white">
      <BackgroundAnimations />
      <main className="relative z-10 mx-auto flex w-full max-w-7xl justify-center px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid w-full items-start lg:items-center gap-6 md:gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10 xl:gap-12">
          <RegisterHero className="animate-slide-in-left max-w-2xl lg:max-w-none" />
          <AuthPanel className="animate-slide-in-right mx-auto w-full max-w-[420px] lg:mx-0 lg:justify-self-center xl:justify-self-end" />
        </div>
      </main>
    </div>
  );
}

function BackgroundAnimations(): JSX.Element {
  return (
    <>
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
      {/* Extra animated elements */}
      <div className="absolute top-1/3 left-1/4 -z-10 h-32 w-32 rounded-full bg-[#7dcfff]/10 blur-2xl animate-float" aria-hidden />
      <div className="absolute bottom-1/3 right-1/4 -z-10 h-40 w-40 rounded-full bg-[#5bb5f0]/10 blur-2xl animate-float-delay" aria-hidden />
    </>
  );
}

interface AuthPanelProps {
  readonly className?: string;
}

function AuthPanel(props?: AuthPanelProps): JSX.Element {
  const { className } = props ?? {};
  const sectionClassName = className ? `relative ${className}` : "relative";
  const t = useTranslations("register.panel");

  type FloatingCardKey =
    | "topCenter"
    | "topLeft"
    | "topRight"
    | "middleLeft"
    | "middleRight"
    | "bottomCenter";

  type FloatingCardContent = {
    readonly title: string;
    readonly description: string;
    readonly capture?: string;
  };

  const floatingCards = useMemo(
    () => t.raw("floatingCards") as Record<FloatingCardKey, FloatingCardContent>,
    [t],
  );

  return (
    <section id="auth" className={sectionClassName}>
      <div className="absolute inset-0 -z-10 rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] bg-white/5 blur-3xl" aria-hidden />
      
      {/* Main Auth Card Container */}
      <div className="relative w-full max-w-[440px] mx-auto">
        {/* Floating cards - positioned around the form */}
        
        <FloatingCardWrapper className="absolute -top-10 lg:-top-12 xl:-top-14 left-1/2 -translate-x-1/2 hidden lg:block z-0">
          <FloatingKPICard2 
            title={floatingCards.topCenter.title}
            description={floatingCards.topCenter.description}
            variant="xp"
            capture={floatingCards.topCenter.capture}
          />
        </FloatingCardWrapper>
        
        {/* Top-left diagonal */}
        <FloatingCardWrapper className="absolute -top-6 lg:-top-8 xl:-top-10 -left-20 lg:-left-32 xl:-left-40 hidden xl:block z-0" delay="float-card-delay-1">
          <FloatingKPICard2 
            title={floatingCards.topLeft.title}
            description={floatingCards.topLeft.description}
            capture={floatingCards.topLeft.capture}
            variant="card"
          />
        </FloatingCardWrapper>
        
        {/* Top-right diagonal */}
        <FloatingCardWrapper className="absolute -top-6 lg:-top-8 xl:-top-10 -right-20 lg:-right-32 xl:-right-40 hidden xl:block z-0" delay="float-card-delay-2">
          <FloatingKPICard2 
            title={floatingCards.topRight.title}
            description={floatingCards.topRight.description}
            capture={floatingCards.topRight.capture}
            variant="ai"
          />
        </FloatingCardWrapper>
        
        {/* Left side */}
        <FloatingCardWrapper className="absolute top-1/2 -translate-y-1/2 -left-36 xl:-left-44 2xl:-left-52 hidden 2xl:block z-0" delay="float-card-delay-3">
          <FloatingKPICard2 
            title={floatingCards.middleLeft.title}
            description={floatingCards.middleLeft.description}
            capture={floatingCards.middleLeft.capture}
            variant="streak"
          />
        </FloatingCardWrapper>
        
        {/* Right side */}
        <FloatingCardWrapper className="absolute top-1/2 -translate-y-1/2 -right-36 xl:-right-44 2xl:-right-52 hidden 2xl:block z-0" delay="float-card-delay-4">
          <FloatingKPICard2 
            title={floatingCards.middleRight.title}
            description={floatingCards.middleRight.description}
            capture={floatingCards.middleRight.capture}
            variant="quiz"
          />
        </FloatingCardWrapper>
        
        {/* Bottom cards */}
        <FloatingCardWrapper className="absolute -bottom-36 lg:-bottom-40 xl:-bottom-44 left-1/2 -translate-x-1/2 hidden xl:block z-0" delay="float-card-delay-5">
          <FloatingKPICard2 
            title={floatingCards.bottomCenter.title}
            description={floatingCards.bottomCenter.description}
            capture={floatingCards.bottomCenter.capture}
            variant="xp"
          />
        </FloatingCardWrapper>
        <div className="relative group">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[-72px] sm:inset-[-84px] lg:inset-[-96px] z-[5] rounded-[2.5rem] bg-[#0b2546]/20 opacity-0 transition-all duration-500 ease-out backdrop-blur-none group-hover:opacity-90 group-hover:backdrop-blur-2xl group-hover:bg-[#0b2546]/35"
          />
          <div className="relative z-10 rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] border border-white/15 bg-white/10 p-6 sm:p-7 lg:p-8 shadow-[0_40px_120px_rgba(5,25,55,0.55)] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_50px_140px_rgba(125,207,255,0.25)] hover:border-white/20 overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#7dcfff]/20 blur-3xl animate-pulse-slow" aria-hidden />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#5bb5f0]/20 blur-3xl animate-pulse-slower" aria-hidden />
            
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 mb-4">
                <h2 className="text-lg sm:text-xl lg:text-[22px] font-semibold text-white animate-fade-in">
                  {t("heading")}
                </h2>
                <span className="inline-flex w-fit rounded-full bg-gradient-to-r from-[#133c66] to-[#1a4a7a] px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-[#a5d8ff] shadow-sm animate-glow">
                  {t("xpBadge")}
                </span>
              </div>
              <p className="text-[13px] sm:text-sm leading-5 sm:leading-6 text-white/70 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {t("description")}
              </p>
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FloatingCardWrapperProps {
  readonly className: string;
  readonly children: JSX.Element;
  readonly delay?: string;
}

function FloatingCardWrapper({ className, children, delay }: FloatingCardWrapperProps): JSX.Element {
  const composed = delay ? `float-card ${delay}` : "float-card";

  return (
    <div className={className}>
      <div className={composed}>{children}</div>
    </div>
  );
}

interface RegisterHeroProps {
  readonly className?: string;
}

function RegisterHero({ className }: RegisterHeroProps): JSX.Element {
  const baseClassName = "flex flex-col justify-center gap-6 md:gap-8 text-white";
  const sectionClassName = className ? `${baseClassName} ${className}` : baseClassName;
  const locale = useLocale();
  const t = useTranslations("register.hero");

  type Benefit = {
    readonly icon: string;
    readonly title: string;
    readonly description: string;
  };

  const benefits = t.raw("benefits") as Benefit[];

  return (
    <section className={sectionClassName}>
      <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.35em] sm:tracking-[0.45em] text-[#a5d8ff]/90 animate-fade-in">
        <span className="hero-accent-line h-[1px] w-6 sm:w-9" aria-hidden /> 
        {t("badge")}
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
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-all duration-500 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15"
          href={`/${locale}`}
        >
          {t("cta.back")}
          <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
        </Link>
        <span className="flex items-center gap-2 sm:gap-3 rounded-full border border-white/20 bg-gradient-to-r from-white/10 to-white/5 px-4 sm:px-5 py-2.5 sm:py-3 text-[10px] sm:text-xs font-medium text-white/70 backdrop-blur-xl hover:border-white/30 transition-all duration-300">
          <span className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-gradient-to-r from-[#1a3b68] to-[#2a4b78] text-[#a5d8ff] animate-pulse">
            {t("cta.badgeValue")}
          </span>
          {t("cta.badgeText")}
        </span>
        <span className="flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-4 py-2.5 text-[10px] sm:text-xs font-medium text-emerald-300">
          {t("cta.free")}
        </span>
      </div>
      
      <ul className="mt-4 md:mt-6 lg:mt-8 grid gap-3 sm:gap-4 sm:grid-cols-2 max-w-xl lg:max-w-[560px]">
        {benefits.map((benefit, index) => (
          <li
            key={benefit.title}
            className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-3 sm:p-4 lg:p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#7dcfff]/60 hover:bg-white/10 hover:shadow-[0_20px_40px_rgba(125,207,255,0.15)] animate-stagger"
            style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
          >
            {/* Background decoration */}
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[#7dcfff]/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden />
            
            <span className="text-lg sm:text-xl inline-block group-hover:animate-wave" aria-hidden>
              {benefit.icon}
            </span>
            <h2 className="mt-2 sm:mt-3 text-sm sm:text-base font-semibold text-white">{benefit.title}</h2>
            <p className="mt-1 text-xs sm:text-sm leading-5 text-white/70">{benefit.description}</p>
            
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

interface FloatingKPICard2Props {
  readonly title: string;
  readonly description: string;
  readonly capture?: string;
  readonly variant: "xp" | "card" | "ai" | "quiz" | "streak" | "emoji";
}

function FloatingKPICard2({ title, description, capture, variant }: FloatingKPICard2Props): JSX.Element {
  // Different styles for each variant
  const getCardStyle = () => {
    switch (variant) {
      case "xp":
        return "border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-orange-600/10";
      case "card":
        return "border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-indigo-600/10";
      case "ai":
        return "border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-blue-600/10";
      case "quiz":
        return "border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-green-600/10";
      case "streak":
        return "border-yellow-400/30 bg-gradient-to-br from-yellow-500/20 to-amber-600/10";
      case "emoji":
        return "border-pink-400/30 bg-gradient-to-br from-pink-500/20 to-rose-600/10";
      default:
        return "border-white/20 bg-gradient-to-br from-white/12 to-white/6";
    }
  };

  const getCaptureColor = () => {
    switch (variant) {
      case "xp":
        return "text-amber-300";
      case "card":
        return "text-purple-300";
      case "ai":
        return "text-cyan-300";
      case "quiz":
        return "text-emerald-300";
      case "streak":
        return "text-yellow-300";
      case "emoji":
        return "text-pink-300";
      default:
        return "text-[#7dcfff]";
    }
  };

  const getAnimationDelay = () => {
    switch (variant) {
      case "card":
      case "emoji":
        return "80ms";
      case "ai":
        return "120ms";
      case "quiz":
        return "160ms";
      case "streak":
        return "200ms";
      default:
        return "40ms";
    }
  };

  const cardStyle = getCardStyle();
  const captureColor = getCaptureColor();
  const animationDelay = getAnimationDelay();

  return (
    <div className="animate-kpi-intro inline-block" style={{ animationDelay }}>
      <div
        className={`relative w-32 lg:w-36 xl:w-40 2xl:w-44 rounded-xl lg:rounded-2xl border ${cardStyle} p-3 lg:p-3.5 xl:p-4 text-[10px] lg:text-[11px] xl:text-xs shadow-lg backdrop-blur-xl transition-all duration-500 opacity-90 hover:opacity-100 hover:scale-105 cursor-pointer text-white`}
      >
        {capture ? (
          <p className={`text-[8px] lg:text-[9px] uppercase tracking-[0.25em] font-bold mb-1 ${captureColor}`}>
            {capture}
          </p>
        ) : null}
        <p className="font-semibold text-white text-[11px] lg:text-xs xl:text-[13px] leading-tight">
          {title}
        </p>
        <p className="mt-1 leading-[1.4] text-white/75 text-[9px] lg:text-[10px] xl:text-[11px]">
          {description}
        </p>
        {/* Animated indicator dot */}
        <div className={`absolute top-2 right-2 h-1.5 w-1.5 rounded-full ${captureColor.replace('text-', 'bg-')} animate-pulse`} />
      </div>
    </div>
  );
}

import type { JSX } from "react";
import { LoginHero } from "./login-hero";
import { LoginForm } from "./login-form";
import { onboardingHighlights } from "../_data/onboarding-highlights";

export function LoginLanding(): JSX.Element {
  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-[#051937] via-[#0a2f5a] to-[#144f92] text-white">
      <BackgroundAnimations />
      <main className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-6 md:gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10 xl:gap-12">
          <LoginHero highlights={onboardingHighlights} className="animate-slide-in-left max-w-2xl lg:max-w-none" />
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

  return (
    <section id="auth" className={sectionClassName}>
      <div className="absolute inset-0 -z-10 rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] bg-white/5 blur-3xl" aria-hidden />
      
      {/* Main Auth Card Container */}
      <div className="relative w-full max-w-[440px] mx-auto">
        {/* Floating cards - closer to form for better visual connection */}
        
        {/* Top card - centered above */}
        <div className="absolute -top-36 lg:-top-40 xl:-top-44 left-1/2 -translate-x-1/2 hidden lg:block z-0">
          <FloatingKPICard2 
            title="Canlı XP Akışı" 
            description="Kullanıcılar anlık XP kazanıyor. Sen de katıl!"
            variant="xp"
            capture="CANLI"
          />
        </div>

        {/* Top-left diagonal */}
        <div className="absolute -top-24 lg:-top-28 xl:-top-32 -left-20 lg:-left-32 xl:-left-40 hidden xl:block z-0">
          <FloatingKPICard2 
            title="Kart Koleksiyonu" 
            description="Nadir kartları topla, vitrininde sergile."
            capture="KOLEKSİYON"
            variant="card"
          />
        </div>

        {/* Top-right diagonal */}
        <div className="absolute -top-24 lg:-top-28 xl:-top-32 -right-20 lg:-right-32 xl:-right-40 hidden xl:block z-0">
          <FloatingKPICard2 
            title="AI Destekli Haberler" 
            description="Senin için özel seçilmiş haberler."
            capture="AI POWERED"
            variant="ai"
          />
        </div>

        {/* Left side - middle */}
        <div className="absolute top-1/2 -translate-y-1/2 -left-36 xl:-left-44 2xl:-left-52 hidden 2xl:block z-0">
          <FloatingKPICard2 
            title="Streak Sistemi" 
            description="Kesintisiz giriş yap, ödüller kazan."
            capture="7 GÜN STREAK"
            variant="streak"
          />
        </div>

        {/* Right side - middle */}
        <div className="absolute top-1/2 -translate-y-1/2 -right-36 xl:-right-44 2xl:-right-52 hidden 2xl:block z-0">
          <FloatingKPICard2 
            title="Günlük Quiz" 
            description="Her gün yeni sorular ve ödüller."
            capture="QUIZ"
            variant="quiz"
          />
        </div>

        {/* Bottom cards - strategically placed around form */}
        <div className="absolute -bottom-36 lg:-bottom-40 xl:-bottom-44 left-1/2 -translate-x-1/2 hidden xl:block z-0">
          <FloatingKPICard2 
            title="Günlük Hedefler" 
            description="Günlük okuma hedefini tamamla."
            capture="HEDEFLER"
            variant="xp"
          />
        </div>
        <div className="absolute -bottom-24 lg:-bottom-28 xl:-bottom-32 -left-24 lg:-left-36 xl:-left-44 hidden lg:block z-0">
          <FloatingKPICard2 
            title="Sosyal Etkileşim" 
            description="Topluluğa katıl, fikirlerini paylaş."
            capture="SOSYAL"
            variant="emoji"
          />
        </div>
        <div className="absolute -bottom-24 lg:-bottom-28 xl:-bottom-32 -right-24 lg:-right-36 xl:-right-44 hidden xl:block z-0">
          <FloatingKPICard2 
            title="Başarı Rozetleri" 
            description="Özel görevleri tamamla, rozet kazan."
            capture="ROZETLER"
            variant="streak"
          />
        </div>
        
        <div className="relative z-10 rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] border border-white/15 bg-white/10 p-6 sm:p-7 lg:p-8 shadow-[0_40px_120px_rgba(5,25,55,0.55)] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_50px_140px_rgba(125,207,255,0.25)] hover:border-white/20 overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#7dcfff]/20 blur-3xl animate-pulse-slow" aria-hidden />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#5bb5f0]/20 blur-3xl animate-pulse-slower" aria-hidden />
          
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 mb-4">
              <h2 className="text-lg sm:text-xl lg:text-[22px] font-semibold text-white animate-fade-in">Nexachron&apos;a Giriş</h2>
              <span className="inline-flex w-fit rounded-full bg-gradient-to-r from-[#133c66] to-[#1a4a7a] px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-[#a5d8ff] shadow-sm animate-glow">
                +10 XP hazır
              </span>
            </div>
            <p className="text-[13px] sm:text-sm leading-5 sm:leading-6 text-white/70 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Güvenilir ajans haberlerine eriş, kişisel streak&apos;ini koru ve liderlik tablosunda yüksel.
            </p>
            <LoginForm />
          </div>
        </div>
      </div>
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

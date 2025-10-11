"use client";

import { useState, useCallback, type JSX } from 'react';
import { useLocale } from 'next-intl';
import { useTrackEvent } from '@/hooks/use-track-event';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Category {
  id: string;
  label: string;
  icon: JSX.Element;
  description: string;
}

interface Mood {
  id: string;
  label: string;
  icon: JSX.Element;
  description: string;
}

const categories: Category[] = [
  {
    id: 'teknoloji',
    label: 'Teknoloji',
    icon: <TechIcon />,
    description: 'AI, yazılım, donanım haberleri',
  },
  {
    id: 'spor',
    label: 'Spor',
    icon: <SportIcon />,
    description: 'Futbol, basketbol, olimpiyatlar',
  },
  {
    id: 'ekonomi',
    label: 'Ekonomi',
    icon: <EconomyIcon />,
    description: 'Borsa, kripto, finans haberleri',
  },
  {
    id: 'siyaset',
    label: 'Siyaset',
    icon: <PoliticsIcon />,
    description: 'Politika, seçimler, hükümet',
  },
  {
    id: 'saglik',
    label: 'Sağlık',
    icon: <HealthIcon />,
    description: 'Tıp, sağlık, bilim haberleri',
  },
  {
    id: 'kultur',
    label: 'Kültür',
    icon: <CultureIcon />,
    description: 'Sanat, müzik, sinema, edebiyat',
  },
  {
    id: 'dunya',
    label: 'Dünya',
    icon: <WorldIcon />,
    description: 'Uluslararası haberler',
  },
  {
    id: 'turkiye',
    label: 'Türkiye',
    icon: <TurkeyIcon />,
    description: 'Yerel haberler ve gelişmeler',
  },
];

const moods: Mood[] = [
  {
    id: 'pozitif',
    label: 'Pozitif',
    icon: <PositiveIcon />,
    description: 'Olumlu ve iyimser haberler',
  },
  {
    id: 'nötr',
    label: 'Dengeli',
    icon: <BalanceIcon />,
    description: 'Tarafsız ve objektif haberler',
  },
  {
    id: 'derinlemesine',
    label: 'Derinlemesine',
    icon: <InsightIcon />,
    description: 'Analiz ve detaylı haberler',
  },
  {
    id: 'hızlı',
    label: 'Hızlı',
    icon: <FlashIcon />,
    description: 'Kısa ve öz haberler',
  },
];

interface PreferencesOnboardingProps {
  onComplete: () => void;
}

export function PreferencesOnboarding({ onComplete }: PreferencesOnboardingProps): JSX.Element {
  const locale = useLocale();
  const track = useTrackEvent();

  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const stepsMeta = [
    {
      id: 1,
      title: 'İlgi alanlarını seç',
      caption: 'En az 3 kategori',
      icon: <NewspaperIcon />,
    },
    {
      id: 2,
      title: 'Okuma tarzını belirle',
      caption: 'Keyfine göre içerik',
      icon: <BookOpenIcon />,
    },
  ];

  const selectedCategoryDetails = categories.filter((category) => selectedCategories.includes(category.id));
  const selectedMoodDetails = moods.filter((mood) => selectedMoods.includes(mood.id));

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    );
  }, []);

  const handleMoodToggle = useCallback((moodId: string) => {
    setSelectedMoods((prev) => (prev.includes(moodId) ? prev.filter((id) => id !== moodId) : [...prev, moodId]));
  }, []);

  const handleNext = useCallback(() => {
    if (step === 1 && selectedCategories.length >= 3) {
      setStep(2);
    }
  }, [step, selectedCategories.length]);

  const handleComplete = useCallback(async () => {
    setIsLoading(true);

    try {
      console.log('Starting onboarding completion...');

      try {
        await track({
          eventType: 'onboarding_complete',
          itemId: 'preferences_setup',
          metadata: {
            categories: selectedCategories,
            moods: selectedMoods,
            step: 'preferences',
          },
        });
        console.log('Event tracked successfully');
      } catch (trackError) {
        console.warn('Failed to track event:', trackError);
      }

      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error('No access token found');
        alert('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      console.log('Saving preferences to database...');

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/v1/user-data/preferences`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizationOptIn: true,
          categories: {
            preferred: selectedCategories,
            blocked: [],
          },
          targetMoods: {
            prefer: selectedMoods,
            avoid: [],
          },
          language: locale,
        }),
      });

      console.log('Preferences API response:', response.status);

      if (response.ok) {
        console.log('Preferences saved successfully, calling onComplete...');
        onComplete();
      } else {
        const errorText = await response.text();
        console.error('Failed to save preferences:', response.status, errorText);
        alert('Tercihler kaydedilemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }, [locale, onComplete, selectedCategories, selectedMoods, track]);

  const canProceed = step === 1 ? selectedCategories.length >= 3 : selectedMoods.length >= 1;
  const progress = (step / stepsMeta.length) * 100;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030b1a] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,140,255,0.25),rgba(3,11,26,0.92))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-[#7a3cff]/35 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-[-160px] h-[520px] w-[520px] rounded-full bg-[#1a3a66]/40 blur-3xl"
      />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <aside className="flex w-full flex-col gap-8 border-b border-white/10 bg-white/5/40 px-6 py-10 backdrop-blur-xl sm:px-10 lg:w-96 lg:border-b-0 lg:border-r lg:bg-white/10">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.45em] text-white/60">
              <span className="h-px w-6 bg-white/40" aria-hidden /> Nexachron
            </span>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight text-white flex items-center gap-2">
                <SparkIcon className="h-6 w-6 text-[#8fb7ff]" />
                Hoş geldiniz, başlayalım
              </h1>
              <p className="text-sm text-white/70">
                Birkaç tercihle Nexachron size özel haber akışını oluşturacak. Tüm seçimlerinizi daha sonra
                profilinizden güncelleyebilirsiniz.
              </p>
            </div>
          </div>

          <ul className="space-y-3">
            {stepsMeta.map((meta) => {
              const isActive = step === meta.id;
              const isCompleted = step > meta.id;

              return (
                <li
                  key={meta.id}
                  className={`rounded-2xl border p-4 transition-all duration-300 ${
                    isActive
                      ? 'border-[#8fb7ff]/60 bg-white/20 shadow-[0_18px_45px_rgba(79,140,255,0.25)]'
                      : isCompleted
                        ? 'border-white/15 bg-white/10'
                        : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold ${
                        isCompleted
                          ? 'bg-[#8fb7ff] text-[#0b1629]'
                          : isActive
                            ? 'bg-gradient-to-r from-[#4f8cff] to-[#8f61ff] text-white'
                            : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {isCompleted ? '✓' : meta.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{meta.title}</p>
                      <p className="text-xs text-white/60">{meta.caption}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-white/50">Kategoriler</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedCategoryDetails.length ? (
                  selectedCategoryDetails.map((category) => (
                    <span
                      key={category.id}
                      className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-[#8fb7ff]" aria-hidden />
                      {category.label}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/50">Henüz seçim yok</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-white/50">Okuma tarzı</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedMoodDetails.length ? (
                  selectedMoodDetails.map((mood) => (
                    <span
                      key={mood.id}
                      className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-[#b792ff]" aria-hidden />
                      {mood.label}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/50">Seçim yapmadınız</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
            Tercihleriniz profil ekranındaki <span className="font-semibold text-white/80">Tercihler</span> bölümünden istediğiniz zaman
            güncellenebilir.
          </div>
        </aside>

        <main className="flex-1 px-6 py-10 sm:px-10 lg:px-16">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
            <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-[0.35em] text-white/50">Adım {step} / {stepsMeta.length}</span>
                <h2 className="text-3xl font-semibold leading-tight text-white">
                  {step === 1 ? 'Hangi haber konularını takip etmek istersiniz?' : 'Nasıl bir okuma deneyimi tercih edersiniz?'}
                </h2>
                <p className="text-sm text-white/70">
                  {step === 1
                    ? 'En az üç kategori seçin. Dilediğiniz kadar kategori işaretleyebilir, daha sonra tekrar düzenleyebilirsiniz.'
                    : 'Bir veya daha fazla okuma tarzı seçebilirsiniz. Tercihleriniz haber akışınızı şekillendirir.'}
                </p>
              </div>
              <div className="w-full sm:w-48">
                <div className="h-1 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4f8cff] via-[#8f61ff] to-[#ff7ab8] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-right text-xs text-white/50">İlerleme %{Math.round(progress)}</p>
              </div>
            </header>

            {step === 1 ? (
              <section className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {categories.map((category) => {
                    const isSelected = selectedCategories.includes(category.id);

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategoryToggle(category.id)}
                        aria-pressed={isSelected}
                        className={`group relative overflow-hidden rounded-3xl border p-5 text-left transition-all duration-300 ${
                          isSelected
                            ? 'border-[#8fb7ff]/70 bg-white/20 shadow-[0_18px_45px_rgba(79,140,255,0.25)]'
                            : 'border-white/10 bg-white/5 hover:border-[#8fb7ff]/60 hover:bg-white/10'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#8fb7ff] text-xs font-semibold text-[#0b1629] shadow-lg">
                            ✓
                          </span>
                        )}
                        <div className="flex items-start gap-4">
                          <span
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-sky-200 transition ${
                              isSelected ? 'border-transparent bg-[#0e1a33]/70 text-[#a7c9ff]' : 'border-white/10 bg-white/5'
                            }`}
                            aria-hidden
                          >
                            {category.icon}
                          </span>
                          <div className="space-y-2">
                            <h3 className="text-base font-semibold text-white">{category.label}</h3>
                            <p className="text-sm leading-5 text-white/60">{category.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : (
              <section className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {moods.map((mood) => {
                    const isSelected = selectedMoods.includes(mood.id);

                    return (
                      <button
                        key={mood.id}
                        type="button"
                        onClick={() => handleMoodToggle(mood.id)}
                        aria-pressed={isSelected}
                        className={`group relative overflow-hidden rounded-3xl border p-6 text-left transition-all duration-300 ${
                          isSelected
                            ? 'border-[#b792ff]/70 bg-white/20 shadow-[0_18px_45px_rgba(143,97,255,0.25)]'
                            : 'border-white/10 bg-white/5 hover:border-[#b792ff]/60 hover:bg-white/10'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#b792ff] text-xs font-semibold text-[#180b29] shadow-lg">
                            ✓
                          </span>
                        )}
                        <div className="flex flex-col gap-3">
                          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#d8c9ff]">
                            {mood.icon}
                          </span>
                          <div className="space-y-2">
                            <h3 className="text-base font-semibold text-white">{mood.label}</h3>
                            <p className="text-sm leading-5 text-white/60">{mood.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <footer className="mt-auto flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-white/60">
                {step === 1
                  ? `${selectedCategories.length} / 3 kategori seçildi`
                  : selectedMoods.length > 0
                    ? `${selectedMoods.length} okuma tarzı seçildi`
                    : 'En az 1 okuma tarzı seçin'}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Geri
                  </button>
                )}
                <button
                  type="button"
                  onClick={step === 2 ? handleComplete : handleNext}
                  disabled={!canProceed || (step === 2 && isLoading)}
                  className={`group inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition-all duration-300 ${
                    canProceed && !(step === 2 && isLoading)
                      ? 'bg-gradient-to-r from-[#4f8cff] via-[#8f61ff] to-[#ff7ab8] text-white shadow-[0_18px_45px_rgba(79,140,255,0.35)] hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(79,140,255,0.4)]'
                      : 'cursor-not-allowed bg-white/10 text-white/35'
                  }`}
                >
                  {step === 2 ? (
                    isLoading ? (
                      <>
                        <svg
                          className="h-5 w-5 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Kaydediliyor
                      </>
                    ) : (
                      <>
                        Tamamla ve Başla
                        <LaunchIcon className="h-4 w-4" />
                      </>
                    )
                  ) : (
                    <>
                      Devam Et
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

// Icon Components
function TechIcon(): JSX.Element {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17 9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
    </svg>
  );
}

function PositiveIcon(): JSX.Element {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16M4 12h16" />
    </svg>
  );
}

function BalanceIcon(): JSX.Element {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16M7 7h10M6 17h12" />
    </svg>
  );
}

function InsightIcon(): JSX.Element {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v4m0 10v4m9-9h-4M7 12H3m14.071-6.071-2.829 2.829M9.757 14.243l-2.829 2.829m0-11.314 2.829 2.829m8.485 8.485-2.829-2.829" />
    </svg>
  );
}

function FlashIcon(): JSX.Element {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 3 4 14h7l-1 7 9-11h-7z" />
    </svg>
  );
}

function NewspaperIcon(): JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20V8h-5V4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h4M6 16h4" />
    </svg>
  );
}

function BookOpenIcon(): JSX.Element {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 0 1 2-2h6v16H5a2 2 0 0 0-2 2V5zm18 0a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2V5z" />
    </svg>
  );
}

function SparkIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className ?? 'h-5 w-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v4m0 10v4m7.071-11.071-2.828 2.828M7.757 16.243l-2.829 2.829m0-11.314 2.829 2.828m11.314 0 2.828-2.828" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className ?? 'h-4 w-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19 8 12l7-7" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className ?? 'h-4 w-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function LaunchIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg className={className ?? 'h-4 w-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19h14M12 3l4 8h-8l4-8zm0 8v8" />
    </svg>
  );
}

function SportIcon(): JSX.Element {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function EconomyIcon(): JSX.Element {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );
}

function PoliticsIcon(): JSX.Element {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
    </svg>
  );
}

function HealthIcon(): JSX.Element {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636 10.682 6.318a4.5 4.5 0 0 0-6.364 0z" />
    </svg>
  );
}

function CultureIcon(): JSX.Element {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2m0 0V1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3m0 0h8" />
    </svg>
  );
}

function WorldIcon(): JSX.Element {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 0 1 2 2v1a2 2 0 0 0 2 2 2 2 0 0 1 2 2v2.945M8 3.935V5.5A2.5 2.5 0 0 0 10.5 8h.5a2 2 0 0 1 2 2 2 2 0 1 0 4 0 2 2 0 0 1 2-2h1.064M15 20.488V18a2 2 0 0 1 2-2h3.064M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  );
}

function TurkeyIcon(): JSX.Element {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657 13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { newsItems } from '../../dashboard/_components/news-data';
import type { DashboardNewsItem } from '../../dashboard/_components/types';
import { TurkeyMap, TURKEY_PROVINCE_NAMES } from '../_components/turkey-map';
import { getSupabaseClient } from '@/lib/supabase/client';

function buildOptions(from: readonly DashboardNewsItem[], correctCity: string, seed: string): string[] {
  const cities = Array.from(
    new Set(
      from
        .map((n) => n.dateline)
        .filter(Boolean)
    )
  ).filter((c) => c !== correctCity);
  const seeded = seededShuffle(cities, seed);
  const distractors = seeded.slice(0, 3);
  return seededShuffle([correctCity, ...distractors], `${seed}:opts`);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Deterministic shuffle utilities for multiplayer so everyone sees the same items order
function hashStringToSeed(input: string): number {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seedString: string): T[] {
  const rand = mulberry32(hashStringToSeed(seedString));
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function NewsGuessrPage(): JSX.Element {
  const t = useTranslations('newsGuessr');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [lastResult, setLastResult] = useState<null | 'correct' | 'wrong'>(null);
  const [showFinal, setShowFinal] = useState(false);
  const [mode, setMode] = useState<'none' | 'single' | 'multi'>('none');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [opponentGuess, setOpponentGuess] = useState<string | null>(null);
  const [roundOutcome, setRoundOutcome] = useState<null | 'win' | 'lose' | 'draw'>(null);
  const [selfGuesses, setSelfGuesses] = useState<Array<{ idx: number; guess: string; correct: boolean }>>([]);
  const [opponentGuesses, setOpponentGuesses] = useState<Array<{ idx: number; guess: string; correct: boolean }>>([]);
  const clientIdRef = useRef<string>(Math.random().toString(36).slice(2));
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabaseClient>['channel']> | null>(null);
  const roundResolvedRef = useRef<boolean>(false);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advancingRef = useRef<boolean>(false);
  const mockOppTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef<number>(0);
  const selfSelectIndexRef = useRef<number | null>(null);
  const opponentSelectIndexRef = useRef<number | null>(null);
  const scheduledIndexRef = useRef<number | null>(null);
  const scheduledOnceRef = useRef<boolean>(false);
  const debug = (...args: unknown[]) => console.log('[NewsGuessr]', ...args);

  // Room detection from URL
  useEffect(() => {
    const room = searchParams.get('room');
    if (room && mode === 'none') {
      setMode('multi');
      setRoomId(room);
    }
  }, [searchParams, mode]);

  const items = useMemo(() => {
    const validCities = new Set(TURKEY_PROVINCE_NAMES);
    const candidates = newsItems.filter((n) => !!n.dateline && !!n.imageUrl && validCities.has(n.dateline));
    const base = seededShuffle(candidates, roomId || 'single').slice(0, 6);
    return base.map((n) => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      imageUrl: n.imageUrl,
      city: n.dateline,
      options: buildOptions(candidates, n.dateline, String(n.id)),
    }));
  }, [roomId]);
  const current = items[index];

  useEffect(() => {
    debug('index change → reset state', { index });
    setSelected(null);
    setShowResult(false);
    setOpponentGuess(null);
    setRoundOutcome(null);
    roundResolvedRef.current = false;
    advancingRef.current = false;
    indexRef.current = index;
    selfSelectIndexRef.current = null;
    opponentSelectIndexRef.current = null;
    scheduledIndexRef.current = null;
    scheduledOnceRef.current = false;
    if (advanceTimeoutRef.current) {
      debug('clear advanceTimeout');
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    if (mockOppTimeoutRef.current) {
      debug('clear mockOppTimeout');
      clearTimeout(mockOppTimeoutRef.current);
      mockOppTimeoutRef.current = null;
    }
  }, [index]);

  // Multiplayer realtime setup
  useEffect(() => {
    if (mode !== 'multi' || !roomId) {
      return;
    }
    const supabase = getSupabaseClient();
    const channel = supabase.channel(`news-guessr:${roomId}`);
    channel.on('broadcast', { event: 'selection' }, (payload) => {
      const data = payload.payload as { idx: number; guess: string; clientId: string };
      // Ignore own events
      if (data.clientId === clientIdRef.current) return;
      if (data.idx !== indexRef.current) return;
      if (mockOppTimeoutRef.current) {
        clearTimeout(mockOppTimeoutRef.current);
        mockOppTimeoutRef.current = null;
      }
      opponentSelectIndexRef.current = data.idx;
      setOpponentGuess((prev) => prev ?? data.guess);
    });
    channel.subscribe();
    channelRef.current = channel;
    return () => {
      channelRef.current = null;
      channel.unsubscribe();
    };
  }, [mode, roomId]);

  const handleSelect = (option: string) => {
    if (selected) return;
    debug('handleSelect', { mode, option, index });
    setSelected(option);
    selfSelectIndexRef.current = index;
    const correct = option === current.city;
    if (mode === 'single') {
      if (correct) {
        setScore((s) => s + 1);
        setCorrectCount((c) => c + 1);
        setLastResult('correct');
      } else {
        setWrongCount((c) => c + 1);
        setLastResult('wrong');
      }
      setSelfGuesses((arr) => (arr.some((g) => g.idx === index) ? arr : [...arr, { idx: index, guess: option, correct }]));
      setShowResult(true);
      scheduleAdvance(1000);
    } else if (mode === 'multi') {
      // Send selection to room
      debug('broadcast selection → send', { index, option });
      channelRef.current?.send({
        type: 'broadcast',
        event: 'selection',
        payload: { idx: index, guess: option, clientId: clientIdRef.current },
      });
      // TEMP MOCK: if no opponent guess arrives shortly, generate a random guess to simulate opponent
      const selectionIndex = index;
      debug('mock opponent schedule', { selectionIndex });
      mockOppTimeoutRef.current = setTimeout(() => {
        // avoid affecting a new question after index changes
        debug('mock opponent fire', { nowIndex: index, selectionIndex, roundResolved: roundResolvedRef.current });
        if (index !== selectionIndex) return;
        if (roundResolvedRef.current) return;
        const opts = current.options;
        const randomGuess = opts[Math.floor(Math.random() * opts.length)];
        opponentSelectIndexRef.current = opponentSelectIndexRef.current ?? selectionIndex;
        setOpponentGuess(prev => prev ?? randomGuess);
      }, 600);
      // Result is computed in effect when both selections are present
    }
  };

  const advanceToNext = () => {
    debug('advanceToNext called', { index, advancing: advancingRef.current });
    if (advancingRef.current) return;
    advancingRef.current = true;
    if (advanceTimeoutRef.current) {
      debug('advanceToNext clearing existing advanceTimeout');
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    if (index < items.length - 1) {
      debug('advanceToNext → setIndex(+1)');
      setIndex((i) => i + 1);
    } else {
      debug('advanceToNext → showFinal');
      setShowFinal(true);
    }
  };

  const scheduleAdvance = (delayMs: number) => {
    if (scheduledOnceRef.current) {
      debug('scheduleAdvance skip (already scheduled)', { index, delayMs, scheduledIndex: scheduledIndexRef.current });
      return;
    }
    scheduledOnceRef.current = true;
    const lockIndex = index;
    scheduledIndexRef.current = lockIndex;
    debug('scheduleAdvance', { lockIndex, delayMs });
    advanceTimeoutRef.current = setTimeout(() => {
      debug('advanceTimeout fire', { currentIndex: index, lockIndex, scheduledIndex: scheduledIndexRef.current });
      if (scheduledIndexRef.current !== lockIndex) return;
      if (index !== lockIndex) return;
      advanceToNext();
    }, delayMs);
  };

  // When both players have selected in multiplayer, compute outcome and advance
  useEffect(() => {
    if (mode !== 'multi') return;
    if (!selected || !opponentGuess) return;
    if (roundResolvedRef.current) return;
    if (selfSelectIndexRef.current !== indexRef.current || opponentSelectIndexRef.current !== indexRef.current) {
      debug('skip outcome: index mismatch', { index: indexRef.current, selfIdx: selfSelectIndexRef.current, oppIdx: opponentSelectIndexRef.current });
      return;
    }
    debug('compute outcome', { index, selected, opponentGuess, city: current.city });
    const selfCorrect = selected === current.city;
    const oppCorrect = opponentGuess === current.city;
    let outcome: 'win' | 'lose' | 'draw' = 'draw';
    if (selfCorrect && !oppCorrect) outcome = 'win';
    else if (!selfCorrect && oppCorrect) outcome = 'lose';
    setRoundOutcome(outcome);
    // record guesses for side panels (once per question)
    setSelfGuesses((arr) => (arr.some((g) => g.idx === index) ? arr : [...arr, { idx: index, guess: selected, correct: selfCorrect }]));
    setOpponentGuesses((arr) => (arr.some((g) => g.idx === index) ? arr : [...arr, { idx: index, guess: opponentGuess, correct: oppCorrect }]));
    // Update personal stats for final summary
    if (selfCorrect) {
      setScore((s) => s + 1);
      setCorrectCount((c) => c + 1);
    } else {
      setWrongCount((c) => c + 1);
    }
    setLastResult(selfCorrect ? 'correct' : 'wrong');
    setShowResult(true);
    roundResolvedRef.current = true;
    scheduleAdvance(1500);
  }, [mode, selected, opponentGuess, current.city, index, items.length]);

  const handleNext = () => {
    if (mode === 'multi') {
      advanceToNext();
      return;
    }
    if (index < items.length - 1) {
      setIndex((i) => i + 1);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] text-[#f6f7fb]">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-3 py-2 rounded-lg border border-white/10 text-white/80 hover:text-white hover:bg-white/5 transition"
              aria-label={t('actions.back', { default: 'Geri' })}
            >
              ← {t('actions.back', { default: 'Geri' })}
            </button>
            <h1 className="text-3xl font-bold">{t('title', { default: 'NewsGuessr' })}</h1>
          </div>
          <div className="text-[#8fb8ff]">{t('score', { score, total: items.length })}</div>
        </div>

        <div className="bg-[#1a2234] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="text-sm text-white/70 mb-2">
              {t('progress', { current: index + 1, total: items.length })}
            </div>
            <h2 className="text-2xl font-semibold mb-2">{current.title}</h2>
            <p className="text-white/70">{current.summary}</p>
          </div>

          {current.imageUrl && (
            <div className="w-full h-64 md:h-80 overflow-hidden">
              <img src={current.imageUrl} alt={current.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Self guesses panel */}
              <aside className="lg:col-span-3 order-2 lg:order-1 lg:hidden">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-blue-950/40 to-blue-900/20 hover:from-blue-900/50 hover:to-blue-800/30 transition">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="text-blue-300 font-semibold">{t('yourGuess', { default: 'Senin Tahminlerin' })}</div>
                    <div className="text-xs text-white/70">
                      <span className="text-green-400 font-semibold">{selfGuesses.filter(g=>g.correct).length}</span>
                      <span className="text-white/50"> / </span>
                      <span className="text-red-400 font-semibold">{selfGuesses.filter(g=>!g.correct).length}</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 text-xs text-white/60">@Sen</div>
                  <ul className="max-h-64 overflow-auto p-3 space-y-2">
                    {selfGuesses.length === 0 && (
                      <li className="text-white/50 text-sm">{t('noGuesses', { default: 'Henüz tahmin yok.' })}</li>
                    )}
                    {selfGuesses.map((g) => (
                      <li
                        key={`self-${g.idx}`}
                        className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:shadow-lg hover:-translate-y-0.5 ${g.correct ? 'bg-green-900/20 hover:bg-green-900/30' : 'bg-red-900/20 hover:bg-red-900/30'}`}
                        title={`Soru ${g.idx + 1}`}
                      >
                        <span className="text-white/80">Soru {g.idx + 1}</span>
                        <span className={`ml-3 font-semibold ${g.correct ? 'text-green-400' : 'text-red-400'}`}>{g.guess}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>

              {/* Center: Map */}
              <div className="lg:col-span-12 order-1 lg:order-2">
                <TurkeyMap
                  selected={selected}
                  correct={showResult ? current.city : null}
                  disabled={!!selected}
                  onSelect={(province) => handleSelect(province)}
                />
                {mode === 'multi' && (selected || opponentGuess) && (
                  <div className="mt-4 text-sm text-white/80">
                    <div className="flex items-center gap-4">
                      <span>{t('yourGuess', { default: 'Senin tahminin' })}: <strong>{selected ?? '-'}</strong></span>
                      <span>{t('opponentGuess', { default: 'Rakibin tahmini' })}: <strong>{opponentGuess ?? '-'}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Opponent guesses panel */}
              <aside className="lg:col-span-3 order-3 lg:hidden">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-purple-950/40 to-purple-900/20 hover:from-purple-900/50 hover:to-purple-800/30 transition">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="text-purple-300 font-semibold">{t('opponentGuess', { default: 'Rakibin Tahminleri' })}</div>
                    <div className="text-xs text-white/70">
                      <span className="text-green-400 font-semibold">{opponentGuesses.filter(g=>g.correct).length}</span>
                      <span className="text-white/50"> / </span>
                      <span className="text-red-400 font-semibold">{opponentGuesses.filter(g=>!g.correct).length}</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 text-xs text-white/60">@Rakip</div>
                  <ul className="max-h-64 overflow-auto p-3 space-y-2">
                    {opponentGuesses.length === 0 && (
                      <li className="text-white/50 text-sm">{t('noGuesses', { default: 'Henüz tahmin yok.' })}</li>
                    )}
                    {opponentGuesses.map((g) => (
                      <li
                        key={`opp-${g.idx}`}
                        className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:shadow-lg hover:-translate-y-0.5 ${g.correct ? 'bg-green-900/20 hover:bg-green-900/30' : 'bg-red-900/20 hover:bg-red-900/30'}`}
                        title={`Soru ${g.idx + 1}`}
                      >
                        <span className="text-white/80">Soru {g.idx + 1}</span>
                        <span className={`ml-3 font-semibold ${g.correct ? 'text-green-400' : 'text-red-400'}`}>{g.guess}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
            {showResult && lastResult && (
              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                <div className={`px-6 py-3 rounded-lg text-2xl font-bold backdrop-blur bg-black/40 ${lastResult === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                  {mode === 'multi' && roundOutcome
                    ? roundOutcome === 'win'
                      ? t('youWin', { default: 'Kazandın!' })
                      : roundOutcome === 'lose'
                        ? t('youLose', { default: 'Kaybettin' })
                        : t('draw', { default: 'Berabere' })
                    : lastResult === 'correct' ? t('correct', { default: 'Doğru!' }) : t('wrong', { default: 'Yanlış' })}
                </div>
              </div>
            )}
          </div>
            {/* Edge-fixed side panels for large screens */}
            <div className="hidden lg:block">
              {/* Left fixed: Self */}
              <div className="fixed left-6 top-1/2 -translate-y-1/2 z-30 w-72">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-blue-950/40 to-blue-900/20 hover:from-blue-900/50 hover:to-blue-800/30 transition shadow-xl">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="text-blue-300 font-semibold">{t('yourGuess', { default: 'Senin Tahminlerin' })}</div>
                    <div className="text-xs text-white/70">
                      <span className="text-green-400 font-semibold">{selfGuesses.filter(g=>g.correct).length}</span>
                      <span className="text-white/50"> / </span>
                      <span className="text-red-400 font-semibold">{selfGuesses.filter(g=>!g.correct).length}</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 text-xs text-white/60">@Sen</div>
                  <ul className="max-h-[40vh] overflow-auto p-3 space-y-2">
                    {selfGuesses.length === 0 && (
                      <li className="text-white/50 text-sm">{t('noGuesses', { default: 'Henüz tahmin yok.' })}</li>
                    )}
                    {selfGuesses.map((g) => (
                      <li key={`self-fixed-${g.idx}`} className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:shadow-lg hover:-translate-y-0.5 ${g.correct ? 'bg-green-900/20 hover:bg-green-900/30' : 'bg-red-900/20 hover:bg-red-900/30'}`} title={`Soru ${g.idx + 1}`}>
                        <span className="text-white/80">Soru {g.idx + 1}</span>
                        <span className={`ml-3 font-semibold ${g.correct ? 'text-green-400' : 'text-red-400'}`}>{g.guess}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Right fixed: Opponent */}
              <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 w-72">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-purple-950/40 to-purple-900/20 hover:from-purple-900/50 hover:to-purple-800/30 transition shadow-xl">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="text-purple-300 font-semibold">{t('opponentGuess', { default: 'Rakibin Tahminleri' })}</div>
                    <div className="text-xs text-white/70">
                      <span className="text-green-400 font-semibold">{opponentGuesses.filter(g=>g.correct).length}</span>
                      <span className="text-white/50"> / </span>
                      <span className="text-red-400 font-semibold">{opponentGuesses.filter(g=>!g.correct).length}</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 text-xs text-white/60">@Rakip</div>
                  <ul className="max-h-[40vh] overflow-auto p-3 space-y-2">
                    {opponentGuesses.length === 0 && (
                      <li className="text-white/50 text-sm">{t('noGuesses', { default: 'Henüz tahmin yok.' })}</li>
                    )}
                    {opponentGuesses.map((g) => (
                      <li key={`opp-fixed-${g.idx}`} className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:shadow-lg hover:-translate-y-0.5 ${g.correct ? 'bg-green-900/20 hover:bg-green-900/30' : 'bg-red-900/20 hover:bg-red-900/30'}`} title={`Soru ${g.idx + 1}`}>
                        <span className="text-white/80">Soru {g.idx + 1}</span>
                        <span className={`ml-3 font-semibold ${g.correct ? 'text-green-400' : 'text-red-400'}`}>{g.guess}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          {/* footer removed: auto-advance enabled */}
        </div>

        {showFinal && (
          <div className="mt-6 p-6 bg-[#1a2234] border border-white/10 rounded-2xl text-center">
            <h3 className="text-2xl font-semibold mb-4">{t('results.title', { default: 'Sonuçlar' })}</h3>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="text-green-400 text-xl font-bold">{t('results.correct', { default: 'Doğru' })}: {correctCount}</div>
              <div className="text-red-400 text-xl font-bold">{t('results.wrong', { default: 'Yanlış' })}: {wrongCount}</div>
            </div>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg text-white font-medium"
            >
              {t('actions.back', { default: 'Çıkış' })}
            </button>
          </div>
        )}
        {/* Manual next fallback after results in multiplayer */}
        {mode === 'multi' && showResult && !showFinal && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-lg border border-white/10 hover:bg-white/5"
            >
              {t('actions.next', { default: 'Sonraki' })}
            </button>
          </div>
        )}
      </div>
      {/* Mode selector overlay */}
      {mode === 'none' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1a2234] border border-white/10 rounded-2xl p-8 w-[90%] max-w-md text-center">
            <h3 className="text-2xl font-semibold mb-2">{t('selectMode.title', { default: 'Oyun Modu Seç' })}</h3>
            <p className="text-white/70 mb-6">{t('selectMode.subtitle', { default: 'Tek oyunculu veya çok oyunculu oynayın.' })}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setMode('single')}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                {t('selectMode.single', { default: 'Tek Oyunculu' })}
              </button>
              <button
                onClick={() => {
                  // Create or use existing room id in URL
                  const existing = searchParams.get('room');
                  const id = existing || Math.random().toString(36).slice(2, 8);
                  setRoomId(id);
                  setMode('multi');
                  const qp = new URLSearchParams(Array.from(searchParams.entries()));
                  qp.set('room', id);
                  router.replace(`?${qp.toString()}`);
                }}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
              >
                {t('selectMode.multi', { default: 'Çok Oyunculu' })}
              </button>
              {roomId && (
                <div className="text-white/60 text-sm mt-2">
                  {t('selectMode.shareRoom', { default: 'Odaya katılmak için bu linki paylaş:' })}
                  <div className="mt-1 break-all text-white">{typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?room=${roomId}` : ''}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



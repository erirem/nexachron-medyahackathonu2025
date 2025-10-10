/*
  Lightweight analytics client for event tracking.
  - Guarantees: anonymous_id & session_id management
  - Transport: sendBeacon preferred, fetch (keepalive) fallback
  - Resilience: localStorage buffer with auto-flush on online/visibilitychange
*/

export type TrackEventPayload = {
  readonly eventId?: string; // optional idempotency key (UUID)
  readonly eventType: string;
  readonly itemId?: string;
  readonly metadata?: Record<string, unknown> | null;
  readonly occurredAt?: string; // ISO
  readonly userId?: string; // optional (if available)
};

type BufferedEvent = TrackEventPayload & {
  readonly anonymousId: string;
  readonly sessionId: string;
};

const ANON_ID_KEY = 'nc_anon_id';
const SESSION_KEY = 'nc_session_id';
const SESSION_LAST_ACTIVITY_KEY = 'nc_session_last_activity';
const BUFFER_KEY = 'nc_event_buffer_v1';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes inactivity

function assertApiUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (!base) throw new Error('NEXT_PUBLIC_API_URL is not configured');
  return base;
}

function nowIso(): string {
  return new Date().toISOString();
}

function generateId(): string {
  // RFC4122-ish v4 UUID fallback; for production prefer crypto.randomUUID when available
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as any).randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreateAnonymousId(): string {
  if (typeof window === 'undefined') return 'server';
  const existing = window.localStorage.getItem(ANON_ID_KEY);
  if (existing) return existing;
  const id = generateId();
  window.localStorage.setItem(ANON_ID_KEY, id);
  return id;
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  const lastActivityStr = window.sessionStorage.getItem(SESSION_LAST_ACTIVITY_KEY);
  const lastActivity = lastActivityStr ? Number(lastActivityStr) : 0;
  const now = Date.now();
  let sessionId = window.sessionStorage.getItem(SESSION_KEY);

  if (!sessionId || (lastActivity && now - lastActivity > SESSION_TTL_MS)) {
    sessionId = generateId();
    window.sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  window.sessionStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(now));
  return sessionId;
}

function readBuffer(): BufferedEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(BUFFER_KEY);
    return raw ? (JSON.parse(raw) as BufferedEvent[]) : [];
  } catch {
    return [];
  }
}

function writeBuffer(events: BufferedEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BUFFER_KEY, JSON.stringify(events));
  } catch {
    // ignore quota errors
  }
}

async function sendBatch(events: BufferedEvent[]): Promise<boolean> {
  if (!events.length) return true;
  const base = assertApiUrl();
  const url = `${base}/api/v1/user-data/events`;
  const payload = { events: events.map(e => ({
    eventId: e.eventId,
    eventType: e.eventType,
    itemId: e.itemId,
    metadata: e.metadata ?? null,
    occurredAt: e.occurredAt ?? nowIso(),
    anonymousId: e.anonymousId,
    sessionId: e.sessionId,
    userId: e.userId,
  })) };

  try {
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const ok = (navigator as any).sendBeacon(url, blob);
      return !!ok;
    }
  } catch {
    // fallthrough to fetch
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function flushBufferedEvents(): Promise<void> {
  const buf = readBuffer();
  if (!buf.length) return;
  const ok = await sendBatch(buf);
  if (ok) writeBuffer([]);
}

function scheduleAutoFlush(): void {
  if (typeof window === 'undefined') return;
  let scheduled = false;
  const ensure = () => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(async () => {
      scheduled = false;
      await flushBufferedEvents();
    }, 250);
  };

  window.addEventListener('online', ensure);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') ensure();
  });
}

let autoFlushInitialized = false;
export function initAnalyticsClient(): void {
  if (autoFlushInitialized) return;
  autoFlushInitialized = true;
  try {
    // hydrate ids
    getOrCreateAnonymousId();
    getOrCreateSessionId();
    scheduleAutoFlush();
    // Initial flush if any
    void flushBufferedEvents();
  } catch {
    // ignore
  }
}

export async function trackEvent(evt: TrackEventPayload): Promise<void> {
  if (typeof window === 'undefined') return;
  const anonymousId = getOrCreateAnonymousId();
  const sessionId = getOrCreateSessionId();

  const buffered: BufferedEvent = {
    anonymousId,
    sessionId,
    eventId: evt.eventId,
    eventType: evt.eventType,
    itemId: evt.itemId,
    metadata: evt.metadata ?? null,
    occurredAt: evt.occurredAt ?? nowIso(),
    userId: evt.userId,
  };

  // Try immediate send; buffer if fails
  const ok = await sendBatch([buffered]);
  if (!ok) {
    const buf = readBuffer();
    buf.push(buffered);
    writeBuffer(buf);
  }
}



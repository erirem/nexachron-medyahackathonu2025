"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

type ClientCacheKey = "persistent" | "session";

const clientCache: Partial<Record<ClientCacheKey, SupabaseClient>> = {};

// Next.js, client bundle'da sadece doğrudan erişilen NEXT_PUBLIC_* değişkenlerini inline eder.
// Dinamik index (process.env[name]) tarayıcıda undefined döner. Bu yüzden sabit bir nesne kullanıyoruz.
const ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
} as const;

function resolveEnv(name: keyof typeof ENV): string {
  const value = ENV[name];
  if (!value) {
    throw new Error(`Supabase yapılandırması eksik: ${name}`);
  }
  return value;
}

function resolveStorageKey(suffix: string): string {
  const url = resolveEnv("NEXT_PUBLIC_SUPABASE_URL");
  const projectRef = url.replace(/^https?:\/\//, "").split(".")[0] ?? "supabase";
  return `sb-${projectRef}-${suffix}`;
}

export function getSupabaseClient(persistSession = true): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("Supabase istemcisi sadece tarayıcıda kullanılabilir.");
  }

  const cacheKey: ClientCacheKey = persistSession ? "persistent" : "session";
  const cached = clientCache[cacheKey];

  if (cached) {
    return cached;
  }

  const url = resolveEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = resolveEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const client = createBrowserClient(url, key, {
    auth: {
      persistSession: true,
      storage: persistSession ? window.localStorage : window.sessionStorage,
      storageKey: resolveStorageKey(persistSession ? "auth" : "session"),
    },
  });

  clientCache[cacheKey] = client;
  return client;
}

export async function getAccessToken(persistSession = true): Promise<string | null> {
  const client = getSupabaseClient(persistSession);
  const { data } = await client.auth.getSession();
  return data.session?.access_token ?? null;
}

"use client";

import { useEffect, useMemo, useState, type JSX } from "react";
import { useRouter } from "next/navigation";

import { getAccessToken, getSupabaseClient } from "@/lib/supabase/client";

type ProfileResponse = {
  user: {
    id: string;
    email: string | null;
    username: string | null;
    city: string | null;
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    xp: number;
    streak: number;
    rankLevel: number;
    lastSeen: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

type FetchState = "idle" | "loading" | "error";

export default function ProfilePage(): JSX.Element {
  const router = useRouter();
  const [state, setState] = useState<FetchState>("idle");
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setError("API adresi tanımlı değil. .env dosyasını kontrol edin.");
      return;
    }

    const fetchProfile = async () => {
      setState("loading");
      setError(null);

      try {
        let accessToken = await getAccessToken(true);
        let persistSession = true;

        if (!accessToken) {
          accessToken = await getAccessToken(false);
          persistSession = false;
        }

        if (!accessToken) {
          setState("idle");
          router.replace("/");
          return;
        }

        const response = await fetch(`${apiUrl}/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 401) {
          await signOutFromAllClients();
          setState("idle");
          router.replace("/");
          return;
        }

        if (!response.ok) {
          throw new Error(`Profil verisi alınamadı (${response.status}).`);
        }

        const payload = (await response.json()) as ProfileResponse;
        setProfile(payload);
        setState("idle");

        // cache active client for logout flow
        cachedClientPreference = persistSession ? "persistent" : "session";
      } catch (cause) {
        console.error("Profil verisi alınamadı", cause);
        setState("error");
        setError("Profil bilgileri yüklenirken hata oluştu.");
      }
    };

    void fetchProfile();
  }, [router]);

  const streakMessage = useMemo(() => {
    if (!profile) {
      return "";
    }

    if (profile.stats.streak === 0) {
      return "Seri başlatmak için bugün haberleri keşfet.";
    }

    if (profile.stats.streak < 3) {
      return `${profile.stats.streak} günlük seri! Devam et.`;
    }

    return `${profile.stats.streak} günlük seri 🔥`; 
  }, [profile]);

  const lastSeenText = useMemo(() => {
    if (!profile?.stats.lastSeen) {
      return "Bilinmiyor";
    }

    const formatter = new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    return formatter.format(new Date(profile.stats.lastSeen));
  }, [profile?.stats.lastSeen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#04163c] via-[#0a2f5a] to-[#113e7b] text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10 md:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Profilim</h1>
            <p className="text-sm text-white/70">Haber ritmini ve XP ilerlemeni buradan takip et.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              void handleLogout(router);
            }}
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/20"
          >
            Çıkış yap
          </button>
        </header>

        {state === "loading" && (
          <section className="rounded-3xl border border-white/10 bg-white/10 px-6 py-10 text-center">
            <p className="text-white/80">Profil bilgilerin yükleniyor...</p>
          </section>
        )}

        {state === "error" && error && (
          <section className="rounded-3xl border border-rose-300/30 bg-rose-400/10 px-6 py-8 text-center">
            <p className="text-sm text-rose-200">{error}</p>
          </section>
        )}

        {state !== "loading" && profile && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
              <h2 className="text-lg font-semibold">Hesap Bilgileri</h2>
              <dl className="mt-4 grid gap-3 text-sm text-white/80">
                <div className="flex justify-between gap-2">
                  <dt className="text-white/60">Kullanıcı adı</dt>
                  <dd>{profile.user.username ?? "Belirtilmedi"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/60">E-posta</dt>
                  <dd>{profile.user.email ?? "Belirtilmedi"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/60">Şehir</dt>
                  <dd>{profile.user.city ?? "Belirtilmedi"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/60">Son görülen</dt>
                  <dd>{lastSeenText}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#133c66]/90 to-[#1d4d85]/60 p-6 shadow-lg">
              <h2 className="text-lg font-semibold">User Stats</h2>
              <div className="mt-4 grid gap-4">
                <StatBadge label="XP" value={profile.stats.xp} accent="from-amber-300 to-orange-400" />
                <StatBadge label="Streak" value={profile.stats.streak} accent="from-emerald-300 to-emerald-500" description={streakMessage} />
                <StatBadge label="Rank Level" value={profile.stats.rankLevel} accent="from-sky-300 to-sky-500" />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

type StatBadgeProps = {
  label: string;
  value: number;
  accent: string;
  description?: string;
};

function StatBadge({ label, value, accent, description }: StatBadgeProps): JSX.Element {
  return (
    <article className="rounded-2xl bg-white/10 p-5 backdrop-blur-lg">
      <span className="text-xs uppercase tracking-wider text-white/60">{label}</span>
      <p className={`mt-2 text-3xl font-semibold bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>{value}</p>
      {description ? <p className="mt-1 text-xs text-white/70">{description}</p> : null}
    </article>
  );
}

type ClientPreference = "persistent" | "session";

let cachedClientPreference: ClientPreference | null = null;

async function signOutFromAllClients() {
  await Promise.allSettled([
    getSupabaseClient(true).auth.signOut({ scope: "local" }),
    getSupabaseClient(false).auth.signOut({ scope: "local" }),
  ]);
  cachedClientPreference = null;
}

async function handleLogout(router: ReturnType<typeof useRouter>) {
  try {
    if (cachedClientPreference === "session") {
      await getSupabaseClient(false).auth.signOut({ scope: "local" });
    } else {
      await getSupabaseClient(true).auth.signOut({ scope: "local" });
      await getSupabaseClient(false).auth.signOut({ scope: "local" });
    }
  } finally {
    cachedClientPreference = null;
    router.replace("/");
  }
}

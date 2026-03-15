'use client';

import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const watchIntegrations = [
  {
    name: 'Oura Ring',
    accent: 'from-violet-500 via-fuchsia-500 to-indigo-500',
    description: 'Sleep, recovery, readiness, and subtle daily rhythm insights.',
  },
  {
    name: 'Garmin',
    accent: 'from-sky-500 via-cyan-500 to-emerald-500',
    description: 'Training load, body battery, heart rate, and performance trends.',
  },
  {
    name: 'Fitbit',
    accent: 'from-pink-500 via-rose-500 to-orange-400',
    description: 'Activity, wellness, and habit signals designed for everyday momentum.',
  },
  {
    name: 'Apple Watch',
    accent: 'from-slate-900 via-indigo-700 to-sky-500',
    description: 'Seamless health metrics, movement, and mindful routine tracking.',
  },
] as const;

// ── Avatar with initials ───────────────────────────────────────────────

function ProfileAvatar({ name }: { name: string }) {
  const initials = name
    .split(/[\s_-]+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-200/50">
      {initials}
    </div>
  );
}

// ── Main content ───────────────────────────────────────────────────────

function ProfileContent() {
  const { user, signOut } = useAuth();
  const { loading } = useRequireAuth();
  const [integrationMessage, setIntegrationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!integrationMessage) return;

    const timeoutId = window.setTimeout(() => {
      setIntegrationMessage(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [integrationMessage]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Profile Header ──────────────────────────────── */}
        <section className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Gradient banner */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Avatar + info */}
          <div className="px-6 pb-8 -mt-10">
            <ProfileAvatar name={user?.username ?? 'U'} />

            <div className="mt-4">
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                {user?.username ?? 'User'}
              </h1>
              {user?.id != null && (
                <p className="text-sm text-slate-400 mt-1 font-mono">ID: {user.id}</p>
              )}
            </div>

            {/* Quick stats row */}
            <div className="flex items-center gap-8 mt-6 pt-6 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Member since</p>
                <p className="text-base font-medium text-slate-700 mt-0.5">March 2026</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Status</p>
                <p className="text-base font-medium text-emerald-600 mt-0.5 flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Active
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Additional Account Settings (Placeholder) ───── */}
        <section className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-700">Account Preferences</h2>
              <p className="text-sm text-slate-400 mt-1">
                Manage your notification and privacy settings here.
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-500 italic mt-4 mb-2">No additional preferences available yet.</p>
        </section>

        {/* ── Watch Integrations ────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/70 to-sky-50/70 p-6 text-slate-900 shadow-xl shadow-indigo-100/50 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(129,140,248,0.14),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.10),_transparent_30%)]" />
          <div className="relative">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-700 shadow-sm backdrop-blur-md">
                  Future Integrations
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                  Integrate your favorite watch
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                  Connect the devices you already trust and let Elevate turn recovery, sleep, stress, and activity into more personal guidance.
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm backdrop-blur-md">
                Wearables designed for a richer, more adaptive experience.
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {watchIntegrations.map((watch) => (
                <button
                  key={watch.name}
                  type="button"
                  onClick={() => setIntegrationMessage(`${watch.name} integration is coming soon.`)}
                  className="group rounded-[1.6rem] border border-white bg-white/70 p-[1px] text-left shadow-lg shadow-indigo-100/40 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:bg-white"
                >
                  <div className="rounded-[1.5rem] bg-white/90 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className={`inline-flex rounded-full bg-gradient-to-r ${watch.accent} px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-lg`}>
                          {watch.name}
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-600">{watch.description}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition group-hover:scale-110 group-hover:bg-white">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="6" y="6" width="12" height="12" rx="3" />
                          <path d="M9 2h6" />
                          <path d="M9 22h6" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tap to connect</span>
                      <span className="text-sm font-medium text-indigo-600 transition group-hover:text-indigo-700">Coming soon</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

          </div>
        </section>

        {/* ── Sign Out ────────────────────────────────────── */}
        <section className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-sm p-6">
          <button
            onClick={signOut}
            className="w-full py-2.5 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
          >
            Sign Out
          </button>
        </section>
      </div>

      {integrationMessage && (
        <div className="pointer-events-none fixed right-4 top-20 z-50 w-[calc(100vw-2rem)] max-w-sm sm:right-6 sm:top-24">
          <div className="pointer-events-auto rounded-3xl border border-indigo-200/80 bg-white/95 p-4 shadow-[0_20px_60px_rgba(99,102,241,0.18)] backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v18" />
                  <path d="M3 12h18" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">Wearable integration</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{integrationMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setIntegrationMessage(null)}
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Dismiss notification"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-slate-100">
          <p className="text-slate-500">Loading…</p>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}

'use client';

import { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';

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

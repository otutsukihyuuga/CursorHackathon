'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { generateMockLeaderboard, LeaderboardEntry } from '@/lib/leaderboardData';
import LeaderboardTable from '@/components/LeaderboardTable';

export default function LeaderboardPage() {
  const { loading, user } = useRequireAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(generateMockLeaderboard());
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Header ──────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Leaderboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Channel your emotions into positive work. The more you contribute, the higher you climb.
          </p>
        </div>

        {/* ── Permission to Feel banner ────────────────────── */}
        <div className="rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px]">
          <div className="rounded-[11px] bg-white/95 backdrop-blur-sm px-5 py-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              <span className="font-semibold text-indigo-600">Permission to Feel</span> —
              every emotion is valid. What matters is how you channel your energy.
              Contribute positively and watch your score grow. 🚀
            </p>
          </div>
        </div>

        {/* ── Leaderboard Card ─────────────────────────────── */}
        <section className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-sm p-5 sm:p-6">
          <LeaderboardTable
            entries={entries}
            currentUserId={user?.username ? user.username : undefined}
          />
        </section>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { generateMockWeek, MoodEntry } from '@/lib/moodMeterData';
import MoodHeatmap from '@/components/MoodHeatmap';
import MoodMeterGrid from '@/components/MoodMeterGrid';

export default function MoodMeterPage() {
  const { loading } = useRequireAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  useEffect(() => {
    setEntries(generateMockWeek());
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* ── Header ──────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Mood Meter
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Your emotional landscape this week — each box is one hour of the day.
          </p>
        </div>

        {/* ── Weekly Heatmap Card ─────────────────────────── */}
        <section className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            Weekly Emotion Heatmap
          </h2>
          <MoodHeatmap entries={entries} />
        </section>

        {/* ── Mood Meter Reference Card ───────────────────── */}
        <section className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-1">
            Mood Meter Reference
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            100 emotions across four quadrants — energy (vertical) × pleasantness (horizontal).
          </p>
          <MoodMeterGrid />
        </section>
      </div>
    </div>
  );
}

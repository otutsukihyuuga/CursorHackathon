'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { generateMockWeek, MoodEntry } from '@/lib/moodMeterData';
import MoodHeatmap from '@/components/MoodHeatmap';
import MoodMeterGrid from '@/components/MoodMeterGrid';

export default function MoodMeterPage() {
  const { user } = useAuth();
  const { loading } = useRequireAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [dataSource, setDataSource] = useState<'sample' | 'your_data'>('sample');
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (dataSource === 'sample') {
        setEntries(generateMockWeek());
        return;
      }
      if (!user?.id) return;
      
      setLoadingData(true);
      try {
        const res = await fetch('/api/mood-meter/week', {
          headers: { 'X-User-Id': String(user.id) }
        });
        const data = await res.json();
        if (data && Array.isArray(data.entries)) {
          setEntries(data.entries);
        } else {
          setEntries([]);
        }
      } catch (err) {
        console.error('Failed to load mood data:', err);
        setEntries([]);
      } finally {
        setLoadingData(false);
      }
    }
    
    loadData();
  }, [dataSource, user?.id]);

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-slate-700">
              Weekly Emotion Heatmap
            </h2>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setDataSource('your_data')}
                disabled={!user}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
                  dataSource === 'your_data' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Your Data
              </button>
              <button
                onClick={() => setDataSource('sample')}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  dataSource === 'sample' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sample Data
              </button>
            </div>
          </div>
          
          {loadingData ? (
            <div className="animate-pulse flex items-center justify-center h-64 bg-slate-50 rounded-xl">
              <p className="text-slate-400">Loading your emotional landscape...</p>
            </div>
          ) : entries.length === 0 && dataSource === 'your_data' ? (
            <div className="flex items-center justify-center h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200 px-4 text-center">
              <p className="text-slate-500">No mood data recorded this week yet. Chat with the AI coach to start logging your emotions!</p>
            </div>
          ) : (
            <MoodHeatmap entries={entries} />
          )}
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

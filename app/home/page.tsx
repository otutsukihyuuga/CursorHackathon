'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function HomePage() {
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
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Home</h1>
          <p className="text-slate-500 mt-2 text-lg">
            Welcome to Elevate. Your dashboard overview is coming soon.
          </p>
        </div>

        {/* Empty State Placeholder */}
        <section className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-sm p-12 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700">Dashboard Empty</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
              This space is reserved for your personalized insights, progress tracking, and shortcuts to your most-used features.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}

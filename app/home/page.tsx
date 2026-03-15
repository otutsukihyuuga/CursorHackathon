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
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Your Journey</h1>
          <p className="text-slate-500 mt-2 text-lg">
            See how Elevate transforms your daily student life.
          </p>
        </div>

        {/* ── Timeline Section ─────────────────────────────────── */}
        <section className="relative w-full max-w-3xl mx-auto py-8">
          {/* Vertical connecting line */}
          <div className="absolute left-[39px] sm:left-1/2 top-10 bottom-10 w-0.5 bg-indigo-100 sm:-translate-x-1/2 rounded-full hidden sm:block"></div>
          {/* Mobile vertical line */}
          <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-indigo-100 rounded-full sm:hidden"></div>

          <div className="space-y-12">
            
            {/* Step 1: The Problem */}
            <div className="relative flex flex-col sm:flex-row items-center sm:justify-between w-full group">
              {/* Left side (Student Picture) */}
              <div className="w-full sm:w-[45%] flex sm:justify-end mb-4 sm:mb-0 pl-24 sm:pl-0 sm:pr-8">
                {/* Placeholder for the student picture the user will send */}
                <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-200 border-4 border-white rounded-2xl shadow-md flex items-center justify-center overflow-hidden flex-shrink-0 relative z-10">
                  <span className="text-slate-400 text-sm font-medium px-4 text-center">Student Image Placeholder</span>
                </div>
              </div>

              {/* Center marker */}
              <div className="absolute left-6 sm:left-1/2 w-8 h-8 rounded-full bg-white border-4 border-indigo-200 shadow-sm sm:-translate-x-1/2 z-10 group-hover:border-indigo-400 transition-colors"></div>

              {/* Right side (Text) */}
              <div className="w-full sm:w-[45%] pl-24 sm:pl-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">The Struggle</h3>
                  <p className="text-slate-600">As a student, you feel overwhelmed and inundated.</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col sm:flex-row-reverse items-center sm:justify-between w-full group">
              <div className="w-full sm:w-[45%] flex sm:justify-start mb-4 sm:mb-0 pl-24 sm:pl-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-slate-600 font-medium">Choose a voice of your mentor or clone the voice of your loved ones.</p>
                </div>
              </div>
              <div className="absolute left-6 sm:left-1/2 w-8 h-8 rounded-full bg-white border-4 border-indigo-200 shadow-sm sm:-translate-x-1/2 z-10 group-hover:border-indigo-400 transition-colors"></div>
              <div className="w-full sm:w-[45%] pr-8 hidden sm:block"></div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col sm:flex-row items-center sm:justify-between w-full group">
              <div className="w-full sm:w-[45%] flex sm:justify-end mb-4 sm:mb-0 pl-24 sm:pl-0 sm:pr-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 w-full text-left sm:text-right">
                  <p className="text-slate-600 font-medium">Chat with your best personalized AI assistant.</p>
                </div>
              </div>
              <div className="absolute left-6 sm:left-1/2 w-8 h-8 rounded-full bg-white border-4 border-indigo-200 shadow-sm sm:-translate-x-1/2 z-10 group-hover:border-indigo-400 transition-colors"></div>
              <div className="w-full sm:w-[45%] pl-8 hidden sm:block"></div>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col sm:flex-row-reverse items-center sm:justify-between w-full group">
              <div className="w-full sm:w-[45%] flex sm:justify-start mb-4 sm:mb-0 pl-24 sm:pl-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-slate-600 font-medium">Create skills, create agent skills, and give them to other students as well.</p>
                </div>
              </div>
              <div className="absolute left-6 sm:left-1/2 w-8 h-8 rounded-full bg-white border-4 border-indigo-200 shadow-sm sm:-translate-x-1/2 z-10 group-hover:border-indigo-400 transition-colors"></div>
              <div className="w-full sm:w-[45%] pr-8 hidden sm:block"></div>
            </div>

            {/* Step 5 */}
            <div className="relative flex flex-col sm:flex-row items-center sm:justify-between w-full group">
              <div className="w-full sm:w-[45%] flex sm:justify-end mb-4 sm:mb-0 pl-24 sm:pl-0 sm:pr-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 w-full text-left sm:text-right">
                  <p className="text-slate-600 font-medium">Track and analyze your mood based on the mood meter.</p>
                </div>
              </div>
              <div className="absolute left-6 sm:left-1/2 w-8 h-8 rounded-full bg-white border-4 border-indigo-200 shadow-sm sm:-translate-x-1/2 z-10 group-hover:border-indigo-400 transition-colors"></div>
              <div className="w-full sm:w-[45%] pl-8 hidden sm:block"></div>
            </div>

            {/* Step 6 */}
            <div className="relative flex flex-col sm:flex-row-reverse items-center sm:justify-between w-full group">
              <div className="w-full sm:w-[45%] flex sm:justify-start mb-4 sm:mb-0 pl-24 sm:pl-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 shadow-indigo-100 text-indigo-900 border-2">
                  <p className="font-bold">Have a healthy competition with other peers.</p>
                </div>
              </div>
              <div className="absolute left-6 sm:left-1/2 w-8 h-8 rounded-full bg-white border-4 border-indigo-400 shadow-md sm:-translate-x-1/2 z-10"></div>
              <div className="w-full sm:w-[45%] pr-8 hidden sm:block"></div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import cloneVoiceImage from './assets/clone_voice.webp';
import leaderboardImage from './assets/leaderboard.webp';
import moodMeterImage from './assets/mood_meter.webp';
import shareSkillsImage from './assets/share_skills.webp';
import talkToPersonalAiImage from './assets/talk_to_personal_ai.webp';
import struggleImage from './assets/The_Struggle.webp';

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
    <div className="flex-1 overflow-y-auto relative bg-slate-50 overflow-hidden">
      
      {/* ── Background Glow Effects ─────────────────────────────────── */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-100/50 to-transparent pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-400/20 blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-16 px-4 py-12 sm:px-8 relative z-10">
        
        {/* Page Header */}
        <div className="text-center md:text-left mb-16 pt-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 tracking-tight pb-2">
            Your Journey
          </h1>
          <p className="text-slate-500 mt-4 text-xl font-medium max-w-2xl">
            See how Elevate transforms your daily student life.
          </p>
        </div>

        {/* ── Timeline Section ─────────────────────────────────── */}
        <section className="relative w-full max-w-4xl mx-auto py-8">
          {/* Vertical connecting line */}
          <div className="absolute left-[39px] sm:left-1/2 top-10 bottom-10 w-1 sm:-translate-x-1/2 rounded-full hidden sm:block bg-gradient-to-b from-indigo-300 via-purple-300 to-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
          {/* Mobile vertical line */}
          <div className="absolute left-[39px] top-10 bottom-10 w-1 bg-gradient-to-b from-indigo-300 via-purple-300 to-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-full sm:hidden"></div>

          <div className="space-y-16">
            
            {/* Step 1: The Problem */}
            <div className="relative flex flex-col sm:flex-row items-center sm:justify-between w-full group min-h-[5rem]">
              <div className="w-full sm:w-[45%] pr-8 hidden sm:block"></div>

              {/* Center marker */}
              <div className="absolute -left-8 sm:left-1/2 w-36 h-36 rounded-full bg-white/80 backdrop-blur-md border-4 border-indigo-200 shadow-xl shadow-indigo-200/50 sm:-translate-x-1/2 z-10 group-hover:border-indigo-400 group-hover:scale-110 transition-all duration-300 overflow-hidden flex items-center justify-center">
                <Image
                  src={struggleImage}
                  alt="The Struggle"
                  width={144}
                  height={144}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Right side (Text) */}
              <div className="w-full sm:w-[45%] pl-40 sm:pl-12 py-2">
                <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-white/50 group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300">
                  <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">The Struggle</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">As a student, you feel overwhelmed and inundated.</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col sm:flex-row-reverse items-center sm:justify-between w-full group min-h-[5rem]">
              <div className="w-full sm:w-[45%] flex sm:justify-start mb-4 sm:mb-0 pl-40 sm:pl-12 py-2">
                <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-white/50 group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300">
                  <p className="text-slate-700 font-semibold leading-relaxed text-lg">Choose a voice of your mentor or clone the voice of your loved ones.</p>
                </div>
              </div>
              <div className="absolute -left-8 sm:left-1/2 w-36 h-36 rounded-full bg-white/80 backdrop-blur-md border-4 border-indigo-200 shadow-xl shadow-indigo-200/50 sm:-translate-x-1/2 z-10 group-hover:border-indigo-400 group-hover:scale-110 transition-all duration-300 overflow-hidden flex items-center justify-center">
                <Image
                  src={cloneVoiceImage}
                  alt="Clone voice"
                  width={144}
                  height={144}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="w-full sm:w-[45%] pr-8 hidden sm:block"></div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col sm:flex-row items-center sm:justify-between w-full group min-h-[5rem]">
              <div className="w-full sm:w-[45%] flex sm:justify-end mb-4 sm:mb-0 pl-40 sm:pl-0 sm:pr-12 py-2">
                <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-white/50 w-full text-left sm:text-right group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300">
                  <p className="text-slate-700 font-semibold leading-relaxed text-lg">Chat with your best, personalized AI assistant.</p>
                </div>
              </div>
              <div className="absolute -left-8 sm:left-1/2 w-36 h-36 rounded-full bg-white/80 backdrop-blur-md border-4 border-indigo-200 shadow-xl shadow-indigo-200/50 sm:-translate-x-1/2 z-10 group-hover:border-indigo-400 group-hover:scale-110 transition-all duration-300 overflow-hidden flex items-center justify-center">
                <Image
                  src={talkToPersonalAiImage}
                  alt="Talk to personal AI"
                  width={144}
                  height={144}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="w-full sm:w-[45%] pl-8 hidden sm:block"></div>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col sm:flex-row-reverse items-center sm:justify-between w-full group min-h-[5rem]">
              <div className="w-full sm:w-[45%] flex sm:justify-start mb-4 sm:mb-0 pl-40 sm:pl-12 py-2">
                <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-white/50 group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300">
                  <p className="text-slate-700 font-semibold leading-relaxed text-lg">Create agent skills, and share them with other students.</p>
                </div>
              </div>
              <div className="absolute -left-8 sm:left-1/2 w-36 h-36 rounded-full bg-white/80 backdrop-blur-md border-4 border-purple-200 shadow-xl shadow-purple-200/50 sm:-translate-x-1/2 z-10 group-hover:border-purple-400 group-hover:scale-110 transition-all duration-300 overflow-hidden flex items-center justify-center">
                <Image
                  src={shareSkillsImage}
                  alt="Share skills"
                  width={144}
                  height={144}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="w-full sm:w-[45%] pr-8 hidden sm:block"></div>
            </div>

            {/* Step 5 */}
            <div className="relative flex flex-col sm:flex-row items-center sm:justify-between w-full group min-h-[5rem]">
              <div className="w-full sm:w-[45%] flex sm:justify-end mb-4 sm:mb-0 pl-40 sm:pl-0 sm:pr-12 py-2">
                <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-white/50 w-full text-left sm:text-right group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300">
                  <p className="text-slate-700 font-semibold leading-relaxed text-lg">Track and analyze your mood using the Mood Meter.</p>
                </div>
              </div>
              <div className="absolute -left-8 sm:left-1/2 w-36 h-36 rounded-full bg-white/80 backdrop-blur-md border-4 border-indigo-200 shadow-xl shadow-indigo-200/50 sm:-translate-x-1/2 z-10 group-hover:border-indigo-400 group-hover:scale-110 transition-all duration-300 overflow-hidden flex items-center justify-center">
                <Image
                  src={moodMeterImage}
                  alt="Mood meter"
                  width={144}
                  height={144}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="w-full sm:w-[45%] pl-8 hidden sm:block"></div>
            </div>

            {/* Step 6 */}
            <div className="relative flex flex-col sm:flex-row-reverse items-center sm:justify-between w-full group min-h-[5rem]">
              <div className="w-full sm:w-[45%] flex sm:justify-start mb-4 sm:mb-0 pl-40 sm:pl-12 py-2">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-[2px] rounded-3xl shadow-xl shadow-indigo-500/30 group-hover:scale-[1.02] transition-all duration-300">
                  <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[22px] h-full">
                    <p className="text-indigo-900 font-black leading-relaxed text-xl tracking-tight">Have a healthy competition with other peers.</p>
                  </div>
                </div>
              </div>
              <div className="absolute -left-8 sm:left-1/2 w-36 h-36 rounded-full bg-indigo-600 border-4 border-white shadow-2xl shadow-indigo-500/50 sm:-translate-x-1/2 z-10 group-hover:scale-110 transition-all duration-300 overflow-hidden flex items-center justify-center">
                <Image
                  src={leaderboardImage}
                  alt="Leaderboard"
                  width={144}
                  height={144}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="w-full sm:w-[45%] pr-8 hidden sm:block"></div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}

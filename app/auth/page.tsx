'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type Tab = 'signin' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<Tab>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'signin') {
        await signIn(username, password);
      } else {
        await signUp(username, password);
      }
      router.push('/home');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const title = tab === 'signin' ? 'Welcome back' : 'Create your account';
  const subtitle =
    tab === 'signin'
      ? 'Step back into a calmer, more focused version of your day.'
      : 'Begin your journey with a more personal, voice-first AI experience.';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_32%),radial-gradient(circle_at_85%_15%,_rgba(168,85,247,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_34%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(238,242,255,0.92))]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <section className="text-slate-900">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-100/80 px-4 py-2 text-sm font-medium text-violet-700 shadow-[0_0_30px_rgba(139,92,246,0.08)] backdrop-blur-md">
                Voice-guided reflection, mentoring, and growth
              </div>
              <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                Make your AI feel
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 bg-clip-text text-transparent"> genuinely personal.</span>
              </h1>
            </div>
          </section>

          <section className="w-full max-w-md justify-self-center lg:justify-self-end">
            <div className="rounded-[2rem] border border-white/80 bg-white/50 p-3 shadow-[0_30px_80px_rgba(99,102,241,0.12)] backdrop-blur-2xl">
              <div className="rounded-[1.6rem] border border-white bg-white/95 p-6 shadow-2xl shadow-indigo-200/30 sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-500">Elevate</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
                  </div>
                  <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-500 text-white shadow-lg sm:flex">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3l7 4v10l-7 4-7-4V7l7-4Z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5">
                  <button
                    type="button"
                    onClick={() => { setTab('signin'); setError(''); }}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                      tab === 'signin'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTab('signup'); setError(''); }}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                      tab === 'signup'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="username" className="mb-2 block text-sm font-semibold text-slate-700">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      required
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                      placeholder="Your username"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                      placeholder="••••••••"
                      autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                    />
                  </div>
                  {error && (
                    <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Please wait…' : tab === 'signin' ? 'Enter Elevate' : 'Create My Account'}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                  {tab === 'signin'
                    ? 'Sign in to continue your conversations, voice library, and mood journey.'
                    : 'Create an account to unlock voice cloning, mood insights, and your personal AI companion.'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

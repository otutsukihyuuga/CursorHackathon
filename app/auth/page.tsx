'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Elevate</h1>
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setTab('signin'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Sign Up
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                placeholder="Your username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                placeholder="••••••••"
                autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

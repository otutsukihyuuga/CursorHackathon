'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function TopNavBar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const placeholderNavClass =
    'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100';

  return (
    <nav className="h-14 w-full bg-white border-b border-slate-200 flex-shrink-0 flex items-center px-2 sm:px-4">
      <div className="flex-1 flex items-center overflow-x-auto pr-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg ${
              pathname === '/'
                ? 'bg-slate-100 text-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            aria-label="Chat"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="sm:w-5 sm:h-5"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-sm font-medium">Chat</span>
          </Link>
          <Link
            href="/voices"
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg ${
              pathname === '/voices'
                ? 'bg-slate-100 text-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            aria-label="Voice Library"
            title="Voice Library"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
            <span className="text-sm font-medium">Voice Library</span>
          </Link>
          <Link
            href="/agent-skills"
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-slate-600 hover:bg-slate-100`}
            aria-label="Agent Skills"
            title="Agent Skills"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5">
              <path d="M12 3a3 3 0 0 0-3 3v1H8a2 2 0 0 0-2 2v1a4 4 0 0 0 2 3.46V16a2 2 0 0 0 2 2h1v1a3 3 0 1 0 6 0v-1h1a2 2 0 0 0 2-2v-2.54A4 4 0 0 0 22 10V9a2 2 0 0 0-2-2h-1V6a3 3 0 0 0-3-3z" />
              <path d="M9.5 11.5h5" />
              <path d="M10 15h4" />
            </svg>
            <span className="text-sm font-medium">Agent Skills</span>
          </Link>
          <Link
            href="/mood-meter"
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg ${
              pathname === '/mood-meter'
                ? 'bg-slate-100 text-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            aria-label="Mood Meter"
            title="Mood Meter"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M8 16V11" />
              <path d="M12 16V8" />
              <path d="M16 16v-5" />
            </svg>
            <span className="text-sm font-medium">Mood Meter</span>
          </Link>
          <Link
            href="/leaderboard"
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg ${
              pathname === '/leaderboard'
                ? 'bg-slate-100 text-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            aria-label="Leaderboard"
            title="Leaderboard"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5">
              <path d="M8 21h8" />
              <path d="M12 17v4" />
              <path d="M7 4h10v3a5 5 0 0 1-10 0V4z" />
              <path d="M17 5h2a2 2 0 0 1 0 4h-2" />
              <path d="M7 5H5a2 2 0 0 0 0 4h2" />
            </svg>
            <span className="text-sm font-medium">Leaderboard</span>
          </Link>
        </div>
      </div>
      
      <div className="flex-shrink-0 ml-2">
        {!loading && (
          user ? (
            <Link
              href="/profile"
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg ${
                pathname === '/profile'
                  ? 'bg-slate-100 text-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              aria-label="Profile"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="sm:w-5 sm:h-5"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
              <span className="text-sm font-medium hidden xs:inline">Profile</span>
            </Link>
          ) : (
            <Link
              href="/auth"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                pathname === '/auth'
                  ? 'bg-slate-100 text-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              aria-label="Sign in"
            >
              Sign In
            </Link>
          )
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}} />
    </nav>
  );
}

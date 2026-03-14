'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayout } from './AppShell';

export default function TopNavBar() {
  const pathname = usePathname();
  const layout = useLayout();
  const isHome = pathname === '/';

  return (
    <nav className="h-14 flex items-center justify-between px-4 bg-white border-b border-slate-200 flex-shrink-0">
      <div className="flex items-center gap-2">
        {isHome && layout ? (
          <button
            onClick={layout.toggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label={layout.sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        ) : (
          <Link
            href="/"
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Back to chat"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        <span className="font-semibold text-slate-800">EchoVoice</span>
      </div>
      <Link
        href="/profile"
        className={`p-2 rounded-lg ${
          pathname === '/profile'
            ? 'bg-slate-100 text-slate-800'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
        aria-label="Profile"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
      </Link>
    </nav>
  );
}

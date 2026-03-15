'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import TopNavBar from './TopNavBar';

interface LayoutContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useLayout() {
  const ctx = useContext(LayoutContext);
  return ctx;
}

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);
  const isAuthRoute = pathname === '/auth';

  useEffect(() => {
    // Auto-collapse sidebar on mobile
    if (window.innerWidth < 640) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <LayoutContext.Provider value={{ sidebarOpen, toggleSidebar }}>
      <div className={isAuthRoute ? 'min-h-screen' : 'min-h-screen flex flex-col'}>
        {!isAuthRoute && <TopNavBar />}
        <main className={isAuthRoute ? 'min-h-screen' : 'flex-1 min-h-0 flex flex-col overflow-y-auto'}>
          {children}
        </main>
      </div>
    </LayoutContext.Provider>
  );
}

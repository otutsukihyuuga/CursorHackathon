'use client';

import { createContext, useCallback, useContext, useState } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <LayoutContext.Provider value={{ sidebarOpen, toggleSidebar }}>
      <div className="h-screen flex flex-col">
        <TopNavBar />
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</main>
      </div>
    </LayoutContext.Provider>
  );
}

'use client';

import ChatSidebar from '@/components/ChatSidebar';
import ChatView from '@/components/ChatView';
import { ChatProvider } from '@/context/ChatContext';
import { useLayout } from '@/components/AppShell';

export default function HomePage() {
  const layout = useLayout();

  return (
    <ChatProvider>
      <div className="flex flex-1 min-h-0 overflow-hidden bg-slate-100">
        <ChatSidebar
          collapsed={!layout?.sidebarOpen}
          onExpand={layout?.toggleSidebar}
        />
        <ChatView />
      </div>
    </ChatProvider>
  );
}

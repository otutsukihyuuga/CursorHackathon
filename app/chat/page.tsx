'use client';

import ChatSidebar from '@/components/ChatSidebar';
import ChatView from '@/components/ChatView';
import { useLayout } from '@/components/AppShell';
import { ChatProvider } from '@/context/ChatContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function ChatPage() {
  const layout = useLayout();
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

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

'use client';

import { useRef, useState } from 'react';
import { useChat } from '@/context/ChatContext';

interface ChatSidebarProps {
  collapsed?: boolean;
  onExpand?: () => void;
}

export default function ChatSidebar({
  collapsed = false,
  onExpand,
}: ChatSidebarProps) {
  const { chats, selectedChatId, selectChat, createEmptyChat } = useChat();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = searchQuery.trim()
    ? chats.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chats;

  return (
    <aside
      className={`bg-white flex flex-col min-h-0 self-stretch transition-all duration-300 flex-shrink-0 overflow-hidden absolute sm:relative z-20 h-full border-r ${
        collapsed 
          ? 'w-0 sm:w-16 -translate-x-full sm:translate-x-0 border-r-transparent sm:border-slate-200 opacity-0 sm:opacity-100' 
          : 'w-full sm:w-72 translate-x-0 border-slate-200 opacity-100'
      }`}
    >
      {collapsed ? (
        /* Collapsed: icon-only bar */
        <div className="flex flex-col items-center py-3 gap-2">
          <button
            onClick={() => createEmptyChat()}
            className="p-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="New chat"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            onClick={() => {
              onExpand?.();
              setSearchOpen(true);
            }}
            className="p-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Search chats"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>
      ) : (
        /* Expanded: full sidebar */
        <>
          <div className="p-3 border-b border-slate-100">
            <button
              onClick={() => createEmptyChat()}
              className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New chat
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-full mt-2 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-2 text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Search chats
            </button>
            {searchOpen && (
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full mt-2 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredChats.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <p>{searchQuery ? 'No matches.' : 'No chats yet.'}</p>
                {!searchQuery && (
                  <p className="mt-1">Click &quot;New chat&quot; to start.</p>
                )}
              </div>
            ) : (
              <ul className="space-y-0.5">
                {filteredChats.map((chat) => (
                  <li key={chat.id}>
                    <button
                      onClick={() => {
                        selectChat(chat.id);
                        if (window.innerWidth < 640 && !collapsed) {
                          onExpand?.();
                        }
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                        selectedChatId === chat.id
                          ? 'bg-green-50 text-green-800'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-lg">
                        🎙
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{chat.name}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {chat.messages.length} message
                          {chat.messages.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

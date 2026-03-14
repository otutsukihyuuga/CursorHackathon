'use client';

import { useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

const AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/mp4',
  'audio/aac',
  'audio/flac',
  'audio/x-m4a',
];

function isAudioFile(file: File) {
  return (
    AUDIO_TYPES.includes(file.type) ||
    /\.(mp3|wav|ogg|webm|mp4|m4a|aac|flac)$/i.test(file.name)
  );
}

export default function ChatView() {
  const { chats, selectedChatId, addMessage, addReferenceAudio, deleteChat } =
    useChat();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chat = chats.find((c) => c.id === selectedChatId);

  const handleSendText = async (text: string) => {
    if (!selectedChatId) return;
    await addMessage(selectedChatId, {
      role: 'user',
      type: 'text',
      content: text,
    });
  };

  const handleSendAudio = async (blob: Blob) => {
    if (!selectedChatId) return;
    await addMessage(selectedChatId, {
      role: 'user',
      type: 'audio',
      content: blob,
    });
  };

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col min-h-0 min-w-0 items-center justify-center bg-slate-50 text-slate-500 overflow-hidden">
        <div className="text-center max-w-sm">
          <span className="text-5xl block mb-4">💬</span>
          <p className="font-medium text-slate-700">Select a chat or create one</p>
          <p className="text-sm mt-1">
            Click &quot;New chat&quot; in the sidebar to start
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-slate-50 overflow-hidden">
      {/* Chat header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-lg">
            🎙
          </span>
          <div>
            <h1 className="font-semibold text-slate-900">{chat.name}</h1>
            <p className="text-xs text-slate-500">
              {chat.referenceAudioDataUrl
                ? `Reference voice · ${chat.messages.length} messages`
                : `${chat.messages.length} messages · Add voice to enable voice features`}
            </p>
          </div>
        </div>
        <button
          onClick={() => deleteChat(chat.id)}
          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
          aria-label="Delete chat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1">
        {chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-4">
            <p>No messages yet.</p>
            <p className="mt-1">Send a text or voice message to get started.</p>
            {!chat.referenceAudioDataUrl && (
              <div className="mt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && isAudioFile(file) && selectedChatId) {
                      await addReferenceAudio(selectedChatId, file, file.name);
                    }
                    e.target.value = '';
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium"
                >
                  Add reference voice
                </button>
              </div>
            )}
          </div>
        ) : (
          chat.messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <MessageInput
        onSendText={handleSendText}
        onSendAudio={handleSendAudio}
        />
      </div>
    </div>
  );
}

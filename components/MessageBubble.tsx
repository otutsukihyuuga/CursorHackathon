'use client';

import type { Message } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-green-600 text-white rounded-br-md'
            : 'bg-slate-100 text-slate-900 rounded-bl-md'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        {!isUser && message.audioDataUrl && (
          <div className="mt-2">
            <audio
              src={message.audioDataUrl}
              controls
              className="w-full max-w-[240px] h-8"
              preload="metadata"
            />
          </div>
        )}
        <p
          className={`text-[10px] mt-1 ${
            isUser ? 'text-green-100' : 'text-slate-500'
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}

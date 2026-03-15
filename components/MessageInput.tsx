'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface MessageInputProps {
  onSendText: (text: string) => void;
  onSendAudio: (blob: Blob) => void;
  disabled?: boolean;
  /** When this changes, the textarea is focused (e.g. after New Chat). */
  focusTrigger?: number;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MessageInput({
  onSendText,
  onSendAudio,
  disabled,
  focusTrigger,
}: MessageInputProps) {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (focusTrigger != null && focusTrigger > 0) {
      textareaRef.current?.focus();
    }
  }, [focusTrigger]);
  const {
    state: recordState,
    audioBlob,
    audioUrl,
    elapsedSeconds,
    error,
    startRecording,
    stopRecording,
    reset,
  } = useAudioRecorder();

  const handleSendText = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSendText(t);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleFileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith('audio/')) return;
      onSendAudio(file);
      e.target.value = '';
    },
    [onSendAudio]
  );

  // When recording stops, send the audio
  const handleRecordComplete = useCallback(() => {
    if (audioBlob) {
      onSendAudio(audioBlob);
      reset();
    }
  }, [audioBlob, onSendAudio, reset]);

  if (recordState === 'stopped' && audioBlob && audioUrl) {
    return (
      <div className="flex items-center gap-3 p-3 border-t border-slate-200 bg-white">
        <div className="flex-1 flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2">
          <span className="text-slate-600 text-sm">Recording ready</span>
          <audio src={audioUrl} controls className="h-8 flex-1 max-w-[200px]" />
        </div>
        <button
          onClick={handleRecordComplete}
          className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium"
        >
          Send
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (recordState === 'recording' || recordState === 'requesting') {
    return (
      <div className="flex items-center gap-3 p-3 border-t border-slate-200 bg-red-50">
        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        <span className="text-red-700 font-medium tabular-nums">
          {recordState === 'recording' ? formatElapsed(elapsedSeconds) : 'Requesting mic…'}
        </span>
        {recordState === 'recording' && (
          <button
            onClick={stopRecording}
            className="ml-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium"
          >
            Stop & Send
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 border-t border-slate-200 bg-white">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileSelected}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
        aria-label="Attach audio"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </button>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 min-h-[42px] max-h-32"
      />
      <button
        onClick={startRecording}
        disabled={disabled}
        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
        aria-label="Record voice message"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>
      <button
        onClick={handleSendText}
        disabled={!text.trim() || disabled}
        className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
      >
        Send
      </button>
      {error && (
        <p className="absolute bottom-full left-3 text-red-600 text-xs">{error}</p>
      )}
    </div>
  );
}

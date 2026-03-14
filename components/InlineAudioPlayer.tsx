'use client';

import { useRef, useState } from 'react';

interface InlineAudioPlayerProps {
  url: string;
  dark?: boolean;
}

export default function InlineAudioPlayer({ url, dark }: InlineAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else await audio.play();
  };

  return (
    <div
      className={`flex items-center gap-2 py-1 ${
        dark ? 'text-green-100' : 'text-slate-700'
      }`}
    >
      <audio
        ref={audioRef}
        src={url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      <button
        onClick={toggle}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          dark ? 'bg-green-700 hover:bg-green-600' : 'bg-white/80 hover:bg-white'
        }`}
      >
        {isPlaying ? (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <rect x="4" y="3" width="3" height="10" rx="1" />
            <rect x="9" y="3" width="3" height="10" rx="1" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <polygon points="4,2 14,8 4,14" />
          </svg>
        )}
      </button>
      <span className="text-xs font-medium">Voice message</span>
    </div>
  );
}

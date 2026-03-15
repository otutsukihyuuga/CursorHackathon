'use client';

import { useRef, useState, useEffect } from 'react';

interface AudioPlayerProps {
  /** Object URL or static URL pointing to an audio resource */
  url: string;
  /** Optional section label shown above the player */
  label?: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Minimal, accessible audio player built on the native HTMLAudioElement.
 * Provides play/pause toggle, a seek scrubber, and time display.
 */
export default function AudioPlayer({ url, label }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Reset player state when the URL changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnded = () => setIsPlaying(false);
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('loadedmetadata', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('play', onPlay);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('loadedmetadata', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('play', onPlay);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      await audio.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = parseFloat(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
      {label && (
        <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">{label}</p>
      )}

      {/* Hidden native audio element — we build custom controls on top */}
      <audio ref={audioRef} src={url} preload="metadata" />

      <div className="flex items-center gap-3">
        {/* Play / Pause button */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="w-11 h-11 rounded-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 flex items-center justify-center transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
        >
          {isPlaying ? (
            // Pause icon
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white" aria-hidden="true">
              <rect x="3" y="2" width="3.5" height="12" rx="1" />
              <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            // Play icon (shifted right for optical centering)
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white" aria-hidden="true">
              <polygon points="4,2 14,8 4,14" />
            </svg>
          )}
        </button>

        {/* Seek scrubber + time */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-slate-600 tabular-nums w-8 flex-shrink-0">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 flex items-center">
            {/* Track background */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none">
              <div className="w-full h-1 bg-slate-200 rounded-full">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.01}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Seek audio"
              className="w-full opacity-0 cursor-pointer h-4 relative z-10"
            />
          </div>

          <span className="text-xs text-slate-600 tabular-nums w-8 text-right flex-shrink-0">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

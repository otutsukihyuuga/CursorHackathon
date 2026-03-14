'use client';

import { useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import AudioPlayer from './AudioPlayer';

interface AudioRecorderProps {
  /** Called once when a recording finishes and the blob is ready */
  onRecordingComplete: (blob: Blob, url: string) => void;
  /** Called when the user discards a recording and resets to idle */
  onDiscard?: () => void;
  /** Label shown on the record button */
  buttonLabel?: string;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Self-contained recording widget.
 *
 * Wraps the useAudioRecorder hook and provides:
 * - A start button (idle / error states)
 * - An animated recording indicator with elapsed timer
 * - A stop button
 * - Inline playback via AudioPlayer after recording stops
 * - A discard / re-record option
 *
 * The parent receives the final Blob + object URL via onRecordingComplete.
 */
export default function AudioRecorder({
  onRecordingComplete,
  onDiscard,
  buttonLabel = 'Start Recording',
}: AudioRecorderProps) {
  const {
    state,
    audioBlob,
    audioUrl,
    elapsedSeconds,
    error,
    startRecording,
    stopRecording,
    reset,
  } = useAudioRecorder();

  // Notify parent as soon as we have a complete recording
  useEffect(() => {
    if (state === 'stopped' && audioBlob && audioUrl) {
      onRecordingComplete(audioBlob, audioUrl);
    }
    // We intentionally omit onRecordingComplete from deps to avoid stale closure loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, audioBlob, audioUrl]);

  const handleDiscard = () => {
    reset();
    onDiscard?.();
  };

  return (
    <div className="space-y-4">
      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm"
        >
          <span className="font-semibold">Microphone error: </span>
          {error}
        </div>
      )}

      {/* IDLE / ERROR — show start button */}
      {(state === 'idle' || state === 'error') && (
        <button
          onClick={startRecording}
          className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-base transition-colors flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
        >
          <span className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0" aria-hidden="true" />
          {buttonLabel}
        </button>
      )}

      {/* REQUESTING — waiting for browser permission */}
      {state === 'requesting' && (
        <div className="text-center text-slate-600 py-6 text-sm animate-pulse">
          Requesting microphone access…
        </div>
      )}

      {/* RECORDING — show live timer + stop button */}
      {state === 'recording' && (
        <div className="space-y-4">
          <div
            aria-live="polite"
            aria-label={`Recording — ${formatElapsed(elapsedSeconds)} elapsed`}
            className="flex items-center justify-center gap-3 py-2"
          >
            <span
              className="w-3 h-3 rounded-full bg-red-500 animate-pulse flex-shrink-0"
              aria-hidden="true"
            />
            <span className="text-red-400 font-mono font-semibold text-2xl tabular-nums">
              {formatElapsed(elapsedSeconds)}
            </span>
            <span className="text-slate-600 text-sm">Recording…</span>
          </div>

          <button
            onClick={stopRecording}
            className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <span
              className="w-3 h-3 rounded bg-white flex-shrink-0"
              aria-hidden="true"
            />
            Stop Recording
          </button>
        </div>
      )}

      {/* STOPPED — show playback + discard option */}
      {state === 'stopped' && audioUrl && (
        <div className="space-y-3">
          <AudioPlayer url={audioUrl} label="Your recording" />

          <button
            onClick={handleDiscard}
            className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Discard &amp; Re-record
          </button>
        </div>
      )}
    </div>
  );
}

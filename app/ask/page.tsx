'use client';

import { useState, useCallback } from 'react';
import AudioRecorder from '@/components/AudioRecorder';
import AudioPlayer from '@/components/AudioPlayer';
import { useFileSave } from '@/hooks/useFileSave';

interface RecordedQuestion {
  blob: Blob;
  url: string;
  filename: string;
  recordedAt: Date;
}

function SaveStatusBadge({ state, error }: { state: string; error: string | null }) {
  if (state === 'saving') {
    return <p className="text-slate-400 text-sm animate-pulse">Saving…</p>;
  }
  if (state === 'saved') {
    return (
      <p className="text-green-400 text-sm flex items-center gap-1.5">
        <span aria-hidden="true">✓</span> Question saved to your device
      </p>
    );
  }
  if (state === 'error' && error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }
  return null;
}

/**
 * Ask page — lets users record a spoken question, preview it, then save locally.
 *
 * Recording is handled by the AudioRecorder component (which uses useAudioRecorder).
 * Saving uses the useFileSave hook (File System Access API with download fallback).
 */
export default function AskPage() {
  const [question, setQuestion] = useState<RecordedQuestion | null>(null);
  const { saveState, saveError, save, resetSaveState } = useFileSave();

  const handleRecordingComplete = useCallback((blob: Blob, url: string) => {
    // Clean up previous recording's object URL if there was one
    if (question?.url) URL.revokeObjectURL(question.url);
    resetSaveState();

    const ext = blob.type.includes('mp4') ? 'm4a' : blob.type.split('/')[1]?.split(';')[0] ?? 'webm';
    setQuestion({
      blob,
      url,
      filename: `question-${Date.now()}.${ext}`,
      recordedAt: new Date(),
    });
  }, [question, resetSaveState]);

  const handleDiscard = useCallback(() => {
    if (question?.url) URL.revokeObjectURL(question.url);
    resetSaveState();
    setQuestion(null);
  }, [question, resetSaveState]);

  const handleSave = () => {
    if (question) save(question.blob, question.filename);
  };

  const formattedTime = question
    ? question.recordedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Ask a Question</h1>
        <p className="text-slate-400 leading-relaxed">
          Record a question you&apos;d like to ask your loved one. Speak naturally —
          your recording will be saved locally on your device.
        </p>
      </div>

      {/* Tips */}
      <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl px-5 py-4 space-y-2">
        <p className="text-purple-300 font-medium text-sm">Tips for a good question</p>
        <ul className="text-purple-400 text-sm space-y-1 list-disc list-inside">
          <li>Speak clearly and at a comfortable pace</li>
          <li>Ask one focused question per recording</li>
          <li>A quiet environment gives the clearest result</li>
        </ul>
      </div>

      {/* Recording section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="space-y-1">
          <h2 className="text-white font-semibold">
            {question ? 'Recording complete' : 'Record your question'}
          </h2>
          <p className="text-slate-400 text-sm">
            {question
              ? `Recorded at ${formattedTime}. Preview it below, then save or re-record.`
              : 'Press the button below and start speaking when ready.'}
          </p>
        </div>

        {/* AudioRecorder handles idle → requesting → recording → stopped states */}
        {!question && (
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            onDiscard={handleDiscard}
            buttonLabel="Record My Question"
          />
        )}

        {/* After recording: show playback + actions */}
        {question && (
          <div className="space-y-4">
            {/* Playback */}
            <AudioPlayer url={question.url} label="Your question" />

            {/* Filename */}
            <p className="text-slate-500 text-xs px-1 truncate">
              File: {question.filename}
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSave}
                disabled={saveState === 'saving'}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                {saveState === 'saving' ? 'Saving…' : '💾 Save Question'}
              </button>

              <button
                onClick={handleDiscard}
                className="flex-1 py-3 rounded-xl border border-white/20 text-slate-300 hover:bg-white/5 hover:text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Discard &amp; Re-record
              </button>
            </div>

            <SaveStatusBadge state={saveState} error={saveError} />
          </div>
        )}
      </div>

      {/* Save explanation */}
      <div className="rounded-xl bg-blue-900/20 border border-blue-500/20 px-4 py-3 text-blue-300 text-sm space-y-1">
        <p className="font-medium">How saving works</p>
        <p className="text-blue-400">
          On Chrome / Edge: a native &quot;Save As&quot; dialog appears so you can choose the exact save
          location. On Firefox, Safari, and other browsers, the file is automatically downloaded to
          your default Downloads folder.
        </p>
      </div>
    </div>
  );
}

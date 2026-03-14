'use client';

import { useState, useCallback } from 'react';
import FileUpload from '@/components/FileUpload';
import AudioRecorder from '@/components/AudioRecorder';
import AudioPlayer from '@/components/AudioPlayer';
import { useFileSave } from '@/hooks/useFileSave';

type InputMode = 'choose' | 'upload' | 'record';

interface AudioSource {
  blob: Blob;
  url: string;
  filename: string;
}

function SaveStatusBadge({ state, error }: { state: string; error: string | null }) {
  if (state === 'saving') {
    return <p className="text-slate-400 text-sm animate-pulse">Saving…</p>;
  }
  if (state === 'saved') {
    return (
      <p className="text-green-400 text-sm flex items-center gap-1.5">
        <span aria-hidden="true">✓</span> File saved successfully
      </p>
    );
  }
  if (state === 'error' && error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }
  return null;
}

/**
 * Upload page — lets users either:
 *   a) Upload an existing audio file from their device, or
 *   b) Record a new voice sample directly in the browser.
 *
 * After either action the user can preview, replace, or save the audio.
 */
export default function UploadPage() {
  const [mode, setMode] = useState<InputMode>('choose');
  const [source, setSource] = useState<AudioSource | null>(null);
  const { saveState, saveError, save, resetSaveState } = useFileSave();

  // Called by FileUpload when a valid file is dropped / picked
  const handleFileSelected = useCallback((file: File, url: string) => {
    // If there's a previous object URL from a recording, revoke it
    if (source?.url && source.url !== url) {
      URL.revokeObjectURL(source.url);
    }
    resetSaveState();
    setSource({ blob: file, url, filename: file.name });
    setMode('upload');
  }, [source, resetSaveState]);

  // Called by AudioRecorder when a recording finishes
  const handleRecordingComplete = useCallback((blob: Blob, url: string) => {
    if (source?.url) URL.revokeObjectURL(source.url);
    resetSaveState();
    const ext = blob.type.includes('mp4') ? 'm4a' : blob.type.split('/')[1]?.split(';')[0] ?? 'webm';
    setSource({ blob, url, filename: `voice-sample-${Date.now()}.${ext}` });
  }, [source, resetSaveState]);

  const handleDiscard = useCallback(() => {
    if (source?.url) URL.revokeObjectURL(source.url);
    resetSaveState();
    setSource(null);
    setMode('choose');
  }, [source, resetSaveState]);

  const handleSave = () => {
    if (source) save(source.blob, source.filename);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Upload a Voice</h1>
        <p className="text-slate-400 leading-relaxed">
          Add a voice sample for your loved one. You can upload an existing audio
          file or record one right here in your browser.
        </p>
      </div>

      {/* Mode selector — only shown before a source is chosen */}
      {mode === 'choose' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setMode('upload')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-2xl p-6 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <span className="text-3xl block mb-3" aria-hidden="true">📁</span>
            <p className="text-white font-semibold">Upload a file</p>
            <p className="text-slate-400 text-sm mt-1">
              MP3, WAV, OGG, M4A and more
            </p>
          </button>

          <button
            onClick={() => setMode('record')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rose-500/50 rounded-2xl p-6 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <span className="text-3xl block mb-3" aria-hidden="true">🎙</span>
            <p className="text-white font-semibold">Record a sample</p>
            <p className="text-slate-400 text-sm mt-1">
              Use your microphone to capture a voice
            </p>
          </button>
        </div>
      )}

      {/* Upload mode */}
      {mode === 'upload' && !source && (
        <div className="space-y-4">
          <FileUpload
            onFileSelected={handleFileSelected}
            currentFileName={source ? (source as AudioSource).filename : null}
          />
          <button
            onClick={() => setMode('choose')}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Record mode */}
      {mode === 'record' && !source && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-white font-semibold">Record a voice sample</h2>
              <p className="text-slate-400 text-sm">
                Speak clearly and aim for at least 30 seconds for the best result.
                Allow microphone access when prompted by your browser.
              </p>
            </div>
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              buttonLabel="Start Recording Voice Sample"
            />
          </div>
          <button
            onClick={() => setMode('choose')}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Source selected — show preview + save */}
      {source && (
        <div className="space-y-5">
          {/* File info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl flex-shrink-0" aria-hidden="true">🎵</span>
            <div className="min-w-0">
              <p className="text-white font-medium text-sm truncate">{source.filename}</p>
              <p className="text-slate-500 text-xs mt-0.5">
                {(source.blob.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          {/* Playback */}
          <AudioPlayer url={source.url} label="Preview" />

          {/* Save + discard actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              disabled={saveState === 'saving'}
              className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              {saveState === 'saving' ? 'Saving…' : '💾 Save to Device'}
            </button>

            <button
              onClick={handleDiscard}
              className="flex-1 py-3 rounded-xl border border-white/20 text-slate-300 hover:bg-white/5 hover:text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Remove &amp; Start Over
            </button>
          </div>

          <SaveStatusBadge state={saveState} error={saveError} />

          {/* Instructions reminder */}
          <div className="rounded-xl bg-blue-900/20 border border-blue-500/20 px-4 py-3 text-blue-300 text-sm space-y-1">
            <p className="font-medium">How saving works</p>
            <p className="text-blue-400">
              On Chrome / Edge: a native &quot;Save As&quot; dialog lets you choose exactly where to save the
              file. On other browsers, the file is downloaded to your default Downloads folder.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

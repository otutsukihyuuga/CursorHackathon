'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { blobToWav } from '@/lib/wavEncoder';

// ── Upload helper (unchanged) ──────────────────────────────────────────

async function uploadClonedVoice({
  userId,
  wavFile,
  voiceName,
  voiceDescription,
}: {
  userId: number;
  wavFile: File;
  voiceName: string;
  voiceDescription?: string;
}) {
  const formData = new FormData();
  formData.append('reference_audio', wavFile);
  formData.append('voice_name', voiceName);
  formData.append('voice_description', voiceDescription ?? '');
  const response = await fetch('/api/cloned-voices', {
    method: 'POST',
    headers: { 'X-User-Id': String(userId) },
    body: formData,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

// ── Avatar with initials ───────────────────────────────────────────────

function ProfileAvatar({ name }: { name: string }) {
  const initials = name
    .split(/[\s_-]+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-200/50">
      {initials}
    </div>
  );
}

// ── Main content ───────────────────────────────────────────────────────

function ProfileContent() {
  const searchParams = useSearchParams();
  const { user, signOut } = useAuth();
  const { loading } = useRequireAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [voiceName, setVoiceName] = useState('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [converting, setConverting] = useState(false);

  const recorder = useAudioRecorder();

  useEffect(() => {
    if (searchParams.get('cloneVoice') === '1') {
      setShowForm(true);
    }
  }, [searchParams]);

  const handleUseRecording = async () => {
    if (!recorder.audioBlob) return;
    setConverting(true);
    try {
      const wavFile = await blobToWav(recorder.audioBlob);
      setSelectedFile(wavFile);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setUploadStatus({ ok: false, message: 'Failed to convert recording to WAV.' });
    } finally {
      setConverting(false);
    }
  };

  const handleCloneVoice = async () => {
    if (!selectedFile || !voiceName.trim() || !user?.id) return;
    setUploading(true);
    setUploadStatus(null);
    try {
      await uploadClonedVoice({
        userId: user.id,
        wavFile: selectedFile,
        voiceName: voiceName.trim(),
        voiceDescription: voiceDescription.trim(),
      });
      setUploadStatus({ ok: true, message: 'Voice cloned successfully!' });
      setSelectedFile(null);
      setVoiceName('');
      setVoiceDescription('');
      setShowForm(false);
      recorder.reset();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadStatus({ ok: false, message: err instanceof Error ? err.message : 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Profile Header ──────────────────────────────── */}
        <section className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Gradient banner */}
          <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Avatar + info */}
          <div className="px-6 pb-6 -mt-10">
            <ProfileAvatar name={user?.username ?? 'U'} />

            <div className="mt-4">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                {user?.username ?? 'User'}
              </h1>
              {user?.id != null && (
                <p className="text-sm text-slate-400 mt-0.5">User ID: {user.id}</p>
              )}
            </div>

            {/* Quick stats row */}
            <div className="flex items-center gap-6 mt-5 pt-5 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Member since</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">March 2026</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Status</p>
                <p className="text-sm font-medium text-emerald-600 mt-0.5 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  Active
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Voice Cloning Section ───────────────────────── */}
        <section className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-start gap-4 mb-5">
            {/* Icon */}
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-700">Voice Cloning</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Upload or record a voice sample to create a cloned voice for your conversations.
              </p>
            </div>
          </div>

          {!showForm ? (
            <button
              onClick={() => { setShowForm(true); setUploadStatus(null); recorder.reset(); setSelectedFile(null); }}
              className="group w-full py-3.5 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover:scale-110">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
              Create New Voice Clone
            </button>
          ) : (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              {/* Voice name */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Voice name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={e => setVoiceName(e.target.value)}
                  placeholder="e.g. My Voice"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={voiceDescription}
                  onChange={e => setVoiceDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow"
                />
              </div>

              {/* Audio input */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Audio (.wav) <span className="text-red-400">*</span>
                </label>

                {/* Record + controls */}
                <div className="flex items-center gap-2 mb-3">
                  {recorder.state === 'idle' || recorder.state === 'error' ? (
                    <button
                      type="button"
                      onClick={recorder.startRecording}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      <span className="w-2 h-2 rounded-full bg-white inline-block animate-pulse" />
                      Record
                    </button>
                  ) : recorder.state === 'recording' || recorder.state === 'requesting' ? (
                    <button
                      type="button"
                      onClick={recorder.stopRecording}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      <span className="w-2 h-2 rounded bg-white inline-block" />
                      Stop {recorder.state === 'recording' && `(${recorder.elapsedSeconds}s)`}
                    </button>
                  ) : null}

                  {recorder.state === 'stopped' && !selectedFile && (
                    <button
                      type="button"
                      onClick={handleUseRecording}
                      disabled={converting}
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      {converting ? 'Converting…' : 'Use Recording'}
                    </button>
                  )}

                  {recorder.state === 'stopped' && (
                    <button
                      type="button"
                      onClick={() => { recorder.reset(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Discard
                    </button>
                  )}
                </div>

                {recorder.state === 'stopped' && recorder.audioUrl && (
                  <audio src={recorder.audioUrl} controls className="w-full h-8 mb-3" />
                )}

                {recorder.error && (
                  <p className="text-xs text-red-500 mb-2">{recorder.error}</p>
                )}

                {/* File upload zone */}
                <div className="relative">
                  <div className="w-full py-4 px-4 border-2 border-dashed border-slate-200 rounded-lg text-center hover:border-slate-300 transition-colors cursor-pointer">
                    <svg className="mx-auto mb-1.5 text-slate-300" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                    <p className="text-xs text-slate-400">
                      {selectedFile ? (
                        <span className="text-indigo-600 font-medium">{selectedFile.name}</span>
                      ) : (
                        <>Drop a <span className="font-medium">.wav</span> file or click to browse</>
                      )}
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".wav,audio/wav"
                    onChange={e => { setSelectedFile(e.target.files?.[0] ?? null); recorder.reset(); }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Status message */}
              {uploadStatus && (
                <div className={`rounded-lg px-4 py-2.5 text-sm ${
                  uploadStatus.ok
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {uploadStatus.message}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleCloneVoice}
                  disabled={uploading || !selectedFile || !voiceName.trim()}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  {uploading ? 'Uploading…' : 'Upload & Clone'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setUploadStatus(null); recorder.reset(); setSelectedFile(null); }}
                  className="py-2.5 px-4 border border-slate-200 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Sign Out ────────────────────────────────────── */}
        <section className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-sm p-6">
          <button
            onClick={signOut}
            className="w-full py-2.5 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
          >
            Sign Out
          </button>
        </section>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-slate-100">
          <p className="text-slate-500">Loading…</p>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}

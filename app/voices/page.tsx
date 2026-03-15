'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { blobToWav } from '@/lib/wavEncoder';
import type { ClonedVoice } from '@/lib/types';

// ── Upload helper ──────────────────────────────────────────

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

// ── Main content ───────────────────────────────────────────────────────

function VoicesContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { loading } = useRequireAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [voiceName, setVoiceName] = useState('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [converting, setConverting] = useState(false);
  
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [deletingVoiceId, setDeletingVoiceId] = useState<number | string | null>(null);

  const recorder = useAudioRecorder();

  const fetchVoices = useCallback(async () => {
    if (!user?.id) return;
    setLoadingVoices(true);
    try {
      const headers: HeadersInit = {};
      const res = await fetch(`/api/users/${encodeURIComponent(user.id)}/cloned-voices`, { headers });
      const data = await res.json().catch(() => []);
      setClonedVoices(Array.isArray(data) ? data : []);
    } catch {
      setClonedVoices([]);
    } finally {
      setLoadingVoices(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchVoices();
    }
  }, [user?.id, fetchVoices]);

  useEffect(() => {
    // If navigated from chat "Add reference voice" button
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
      await fetchVoices(); // Refresh the list
      recorder.reset();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadStatus({ ok: false, message: err instanceof Error ? err.message : 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVoice = async (voiceId: number | string) => {
    if (!user?.id) return;
    if (!window.confirm('Are you sure you want to delete this cloned voice?')) return;
    
    setDeletingVoiceId(voiceId);
    try {
      // Use the generic /api/proxy endpoint if a specific delete endpoint doesn't exist,
      // or we can construct a direct fetch against the backend.
      // Based on typical REST, let's assume DELETE /users/:id/cloned-voices/:voiceId
      const res = await fetch(`/api/proxy?path=/users/${user.id}/cloned-voices/${voiceId}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': String(user.id) },
      });
      if (!res.ok) throw new Error('Failed to delete voice');
      await fetchVoices();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting voice');
    } finally {
      setDeletingVoiceId(null);
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
    <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Voice Library</h1>
          <p className="text-slate-500 mt-2 text-lg">
            Create and manage cloned voices for your conversations.
          </p>
        </div>

        {/* ── Existing Voices Section ───────────────────────── */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 px-1">Your Voices</h2>
          {loadingVoices ? (
            <div className="animate-pulse flex gap-4 overflow-x-auto pb-4 px-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="min-w-[240px] h-24 bg-slate-200 rounded-2xl flex-shrink-0" />
              ))}
            </div>
          ) : clonedVoices.length === 0 ? (
            <div className="text-center py-10 bg-white/50 border border-slate-200 border-dashed rounded-2xl">
              <p className="text-slate-500">You haven't cloned any voices yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {clonedVoices.map((voice) => (
                <div key={String(voice.id)} className="group relative bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-50">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                      </svg>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteVoice(voice.id)}
                      disabled={deletingVoiceId === voice.id}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      aria-label="Delete voice"
                      title="Delete voice"
                    >
                      {deletingVoiceId === voice.id ? (
                        <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  <h3 className="font-semibold text-slate-800">{voice.voice_name ?? voice.name ?? voice.display_name ?? `Voice ${voice.id}`}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {voice.description ? voice.description : 'No description provided.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Voice Cloning Form Section ───────────────────────── */}
        <section className="rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-800">New Voice Clone</h2>
              <p className="text-slate-500 mt-1">
                Upload or record a high-quality voice sample. The clearer the audio, the better the clone will sound.
              </p>
            </div>
          </div>

          {!showForm ? (
            <button
              onClick={() => { setShowForm(true); setUploadStatus(null); recorder.reset(); setSelectedFile(null); }}
              className="group w-full py-4 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover:scale-110">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
              Create Voice Clone
            </button>
          ) : (
            <div className="space-y-5 rounded-xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6 shadow-inner">
              {/* Voice name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 pt-1">
                  Voice name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={e => setVoiceName(e.target.value)}
                  placeholder="e.g. My Professional Voice"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={voiceDescription}
                  onChange={e => setVoiceDescription(e.target.value)}
                  placeholder="Optional description for this voice"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                />
              </div>

              {/* Audio input */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Audio (.wav) <span className="text-red-400">*</span>
                </label>

                {/* Record + controls */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {recorder.state === 'idle' || recorder.state === 'error' ? (
                    <button
                      type="button"
                      onClick={recorder.startRecording}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors shadow-sm"
                    >
                      <span className="w-2 h-2 rounded-full bg-white inline-block animate-pulse" />
                      Record
                    </button>
                  ) : recorder.state === 'recording' || recorder.state === 'requesting' ? (
                    <button
                      type="button"
                      onClick={recorder.stopRecording}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-colors shadow-sm"
                    >
                      <span className="w-2.5 h-2.5 rounded bg-white inline-block" />
                      Stop {recorder.state === 'recording' && `(${recorder.elapsedSeconds}s)`}
                    </button>
                  ) : null}

                  {recorder.state === 'stopped' && !selectedFile && (
                    <button
                      type="button"
                      onClick={handleUseRecording}
                      disabled={converting}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors shadow-sm"
                    >
                      {converting ? 'Converting…' : 'Use Recording'}
                    </button>
                  )}

                  {recorder.state === 'stopped' && (
                    <button
                      type="button"
                      onClick={() => { recorder.reset(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Discard
                    </button>
                  )}
                </div>

                {recorder.state === 'stopped' && recorder.audioUrl && (
                  <audio src={recorder.audioUrl} controls className="w-full h-10 mb-4 rounded-lg bg-slate-100" />
                )}

                {recorder.error && (
                  <p className="text-sm text-red-500 mb-3 bg-red-50 p-3 rounded-lg border border-red-100">{recorder.error}</p>
                )}

                {/* File upload zone */}
                <div className="relative">
                  <div className="w-full py-8 px-4 border-2 border-dashed border-slate-300 rounded-xl bg-white text-center hover:bg-slate-50 hover:border-indigo-300 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[140px]">
                    <svg className="mb-3 text-slate-400" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                    <p className="text-slate-500 text-sm">
                      {selectedFile ? (
                        <span className="text-indigo-600 font-semibold text-base">{selectedFile.name}</span>
                      ) : (
                        <span>Drag and drop a <span className="font-semibold text-slate-700">.wav</span> file or click to browse</span>
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
                <div className={`rounded-lg px-4 py-3 text-sm flex items-start gap-2 ${
                  uploadStatus.ok
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <span className="mt-0.5">{uploadStatus.ok ? '✅' : '❌'}</span>
                  <span>{uploadStatus.message}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200 mt-6">
                <button
                  onClick={handleCloneVoice}
                  disabled={uploading || !selectedFile || !voiceName.trim()}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-sm"
                >
                  {uploading ? 'Uploading & Processing...' : 'Upload & Clone Voice'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setUploadStatus(null); recorder.reset(); setSelectedFile(null); }}
                  className="py-3 px-6 border border-slate-300 rounded-xl font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default function VoicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-slate-100">
          <p className="text-slate-500">Loading…</p>
        </div>
      }
    >
      <VoicesContent />
    </Suspense>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { blobToWav } from '@/lib/wavEncoder';

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

export default function ProfilePage() {
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
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <div className="max-w-md mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Profile</h1>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <p className="text-sm text-slate-500">Account</p>
            <p className="font-medium text-slate-800">
              {user?.username ?? 'User'}
            </p>
            {user?.id != null && (
              <p className="text-sm text-slate-600 mt-1">ID: {user.id}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-500">Settings</p>
            <p className="text-slate-600 text-sm">Manage your preferences here.</p>
          </div>
          <div>
            <button
              onClick={() => { setShowForm(v => !v); setUploadStatus(null); recorder.reset(); setSelectedFile(null); }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Clone Voice
            </button>

            {showForm && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Voice name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={voiceName}
                    onChange={e => setVoiceName(e.target.value)}
                    placeholder="e.g. My Voice"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={voiceDescription}
                    onChange={e => setVoiceDescription(e.target.value)}
                    placeholder="Optional description"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-2">Audio (.wav) <span className="text-red-500">*</span></label>

                  {/* Record section */}
                  <div className="flex items-center gap-2 mb-2">
                    {recorder.state === 'idle' || recorder.state === 'error' ? (
                      <button
                        type="button"
                        onClick={recorder.startRecording}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-white inline-block" />
                        Record
                      </button>
                    ) : recorder.state === 'recording' || recorder.state === 'requesting' ? (
                      <button
                        type="button"
                        onClick={recorder.stopRecording}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
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
                        className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {converting ? 'Converting…' : 'Use Recording'}
                      </button>
                    )}

                    {recorder.state === 'stopped' && (
                      <button
                        type="button"
                        onClick={() => { recorder.reset(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700"
                      >
                        Discard
                      </button>
                    )}
                  </div>

                  {recorder.state === 'stopped' && recorder.audioUrl && (
                    <audio src={recorder.audioUrl} controls className="w-full h-8 mb-2" />
                  )}

                  {recorder.error && (
                    <p className="text-xs text-red-500 mb-2">{recorder.error}</p>
                  )}

                  {/* Or upload a file */}
                  <p className="text-xs text-slate-400 mb-1">or upload a file</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".wav,audio/wav"
                    onChange={e => { setSelectedFile(e.target.files?.[0] ?? null); recorder.reset(); }}
                    className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium hover:file:bg-slate-200"
                  />
                  {selectedFile && (
                    <p className="text-xs text-slate-500 mt-1">{selectedFile.name}</p>
                  )}
                </div>
                {uploadStatus && (
                  <p className={`text-sm ${uploadStatus.ok ? 'text-green-600' : 'text-red-600'}`}>
                    {uploadStatus.message}
                  </p>
                )}
                <button
                  onClick={handleCloneVoice}
                  disabled={uploading || !selectedFile || !voiceName.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  {uploading ? 'Uploading…' : 'Upload & Clone'}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={signOut}
            className="mt-4 w-full py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

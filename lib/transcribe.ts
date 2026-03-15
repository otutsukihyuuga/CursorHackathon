/**
 * Transcribe audio using Sarvam AI via our /api/transcribe proxy.
 * Keeps the API key server-side.
 */
export async function transcribeAudio(blob: Blob): Promise<{ transcript: string; language_code: string | null }> {
  const formData = new FormData();
  const ext = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('webm') ? 'webm' : 'wav';
  formData.append('file', blob, `audio.${ext}`);

  const res = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? 'Transcription failed');
  }

  return {
    transcript: data.transcript ?? '',
    language_code: data.language_code ?? null,
  };
}

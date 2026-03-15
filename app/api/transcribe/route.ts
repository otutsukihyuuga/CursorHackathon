import { NextRequest, NextResponse } from 'next/server';

const SARVAM_API_URL = 'https://api.sarvam.ai/speech-to-text';

export async function POST(request: NextRequest) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'SARVAM_API_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json(
        { error: 'Missing audio file' },
        { status: 400 }
      );
    }

    // Sarvam rejects audio/webm;codecs=opus - use audio/webm
    const normalizedType = file.type.startsWith('audio/webm') ? 'audio/webm' : file.type;
    const buffer = await file.arrayBuffer();
    const normalizedFile = new File([buffer], file.name || 'audio.webm', {
      type: normalizedType,
    });

    const sarvamFormData = new FormData();
    sarvamFormData.append('model', 'saaras:v3');
    sarvamFormData.append('mode', 'translate');
    sarvamFormData.append('file', normalizedFile, normalizedFile.name);

    const response = await fetch(SARVAM_API_URL, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
      },
      body: sarvamFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message ?? 'Transcription failed';
      return NextResponse.json(
        { error: message },
        { status: response.status }
      );
    }

    return NextResponse.json({
      transcript: data.transcript ?? '',
      language_code: data.language_code ?? null,
    });
  } catch (err) {
    console.error('Transcription error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Transcription failed' },
      { status: 500 }
    );
  }
}

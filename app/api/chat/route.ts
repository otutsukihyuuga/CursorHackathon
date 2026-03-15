import { NextRequest, NextResponse } from 'next/server';

function getBackendUrl(): string {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  return url.replace(/\/$/, '');
}

/** Request body for POST /chat */
interface ChatRequestBody {
  conversation_id: string;
  user_message: string;
  cloned_voice_name?: string;
}

/** POST /api/chat - send message and get agent response (proxies to backend /chat) */
export async function POST(request: NextRequest) {
  const userId = request.headers.get('X-User-Id');
  if (!userId) {
    return NextResponse.json({ error: 'Missing X-User-Id header' }, { status: 400 });
  }
  const auth = request.headers.get('Authorization');

  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { conversation_id, user_message, cloned_voice_name } = body;
  if (!conversation_id || typeof user_message !== 'string') {
    return NextResponse.json(
      { error: 'conversation_id and user_message are required' },
      { status: 400 }
    );
  }

  try {
    const base = getBackendUrl();
    const payload: { conversation_id: string; user_message: string; cloned_voice_name?: string } = {
      conversation_id,
      user_message,
    };
    if (cloned_voice_name != null && cloned_voice_name !== '') {
      payload.cloned_voice_name = cloned_voice_name;
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
      Accept: 'application/json',
    };
    if (auth) headers['Authorization'] = auth;
    const res = await fetch(`${base}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        data && typeof data === 'object' ? data : { error: 'Chat request failed' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Chat proxy error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Chat request failed' },
      { status: 500 }
    );
  }
}

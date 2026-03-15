import { NextRequest, NextResponse } from 'next/server';

function getBackendUrl(): string {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  return url.replace(/\/$/, '');
}

/** GET /api/users/[userId]/cloned-voices - list cloned voices for the user (proxies to backend) */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const base = getBackendUrl();
    const headers: HeadersInit = {
      Accept: 'application/json',
      'X-User-Id': userId,
    };
    const auth = request.headers.get('Authorization');
    if (auth) headers['Authorization'] = auth;
    const res = await fetch(`${base}/users/${encodeURIComponent(userId)}/cloned-voices`, {
      method: 'GET',
      headers,
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        data && typeof data === 'object' ? data : { error: 'Failed to fetch cloned voices' },
        { status: res.status }
      );
    }

    const list = Array.isArray(data) ? data : (data?.items ?? data?.cloned_voices ?? []);
    const normalizedList = Array.isArray(list)
      ? list.map((item) => {
          if (!item || typeof item !== 'object') return item;

          return {
            ...item,
            name: item.name ?? item.voice_name ?? item.display_name,
            description: item.description ?? item.voice_description,
          };
        })
      : [];

    return NextResponse.json(normalizedList);
  } catch (err) {
    console.error('Cloned voices proxy error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch cloned voices' },
      { status: 500 }
    );
  }
}

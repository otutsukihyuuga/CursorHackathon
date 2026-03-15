import { NextRequest, NextResponse } from 'next/server';

const getBackendUrl = () => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  return url.replace(/\/$/, '');
};

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ message: 'Missing X-User-Id header' }, { status: 400 });
    }

    const res = await fetch(`${getBackendUrl()}/mood-meter/week`, {
      method: 'GET',
      headers: { 'X-User-Id': userId },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Mood meter proxy error:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Fetch failed' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

const getBackendUrl = () => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  return url.replace(/\/$/, '');
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${getBackendUrl()}/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Signup proxy error:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Signup failed' },
      { status: 500 }
    );
  }
}

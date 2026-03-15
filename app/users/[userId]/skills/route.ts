import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const res = await fetch(`${getBackendUrl()}/users/${encodeURIComponent(userId)}/skills`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-User-Id': userId,
      },
    });
    const data = await res.json().catch(() => []);

    if (!res.ok) {
      return NextResponse.json(
        data && typeof data === 'object' ? data : { error: 'Failed to load skills' },
        { status: res.status }
      );
    }

    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load skills' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      skill_text_context?: string;
      is_public?: boolean;
    };

    if (!body.name || typeof body.skill_text_context !== 'string') {
      return NextResponse.json(
        { error: 'name and skill_text_context are required' },
        { status: 400 }
      );
    }

    const res = await fetch(`${getBackendUrl()}/users/${encodeURIComponent(userId)}/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-User-Id': userId,
      },
      body: JSON.stringify({
        name: body.name,
        skill_text_context: body.skill_text_context,
        is_public: body.is_public ?? false,
      }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        data && typeof data === 'object' ? data : { error: 'Failed to create skill' },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create skill' },
      { status: 500 }
    );
  }
}

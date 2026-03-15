import { NextResponse } from 'next/server';
import { writeAgentSkill } from '@/lib/agentSkills';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      filename?: string;
      contentBinary?: string;
    };

    if (!body.filename || typeof body.contentBinary !== 'string') {
      return NextResponse.json(
        { error: 'filename and contentBinary are required' },
        { status: 400 }
      );
    }

    await writeAgentSkill(body.filename, body.contentBinary);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create skill' },
      { status: 500 }
    );
  }
}

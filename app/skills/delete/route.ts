import { NextResponse } from 'next/server';
import { deleteAgentSkill } from '@/lib/agentSkills';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      filename?: string;
    };

    if (!body.filename) {
      return NextResponse.json({ error: 'filename is required' }, { status: 400 });
    }

    await deleteAgentSkill(body.filename);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete skill' },
      { status: 500 }
    );
  }
}

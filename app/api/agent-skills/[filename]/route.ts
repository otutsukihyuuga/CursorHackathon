import { NextResponse } from 'next/server';
import { readAgentSkill } from '@/lib/agentSkills';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const skill = await readAgentSkill(filename);
    return NextResponse.json(skill);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load skill';
    const status = message.includes('ENOENT') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

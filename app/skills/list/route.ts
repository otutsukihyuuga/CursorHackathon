import { NextResponse } from 'next/server';
import { listAgentSkillRecords } from '@/lib/agentSkills';

export async function GET() {
  try {
    const skills = await listAgentSkillRecords();
    return NextResponse.json({ skills });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to list skills' },
      { status: 500 }
    );
  }
}

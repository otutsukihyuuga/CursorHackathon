import { NextResponse } from 'next/server';
import { listAgentSkills, writeAgentSkill } from '@/lib/agentSkills';

export async function GET() {
  try {
    const skills = await listAgentSkills();
    return NextResponse.json({ skills });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load skills' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing .md file' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.md')) {
      return NextResponse.json({ error: 'Only .md files are allowed' }, { status: 400 });
    }

    const content = await file.text();
    const skill = await writeAgentSkill(file.name, content);
    return NextResponse.json({ skill }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create skill';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

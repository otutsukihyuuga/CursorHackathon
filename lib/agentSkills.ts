import { mkdir, readdir, readFile, rm, stat, writeFile } from 'fs/promises';
import path from 'path';

export interface AgentSkillSummary {
  filename: string;
  displayName: string;
  updatedAt: number;
}

export interface AgentSkillRecord extends AgentSkillSummary {
  contentBinary: string;
}

const SKILLS_DIR = path.join(process.cwd(), 'agent-skills');

function toDisplayName(filename: string): string {
  return filename.replace(/\.md$/i, '');
}

export async function ensureSkillsDir() {
  await mkdir(SKILLS_DIR, { recursive: true });
  return SKILLS_DIR;
}

export function sanitizeSkillFilename(filename: string): string {
  const baseName = path.basename(filename).trim();
  if (!baseName || baseName === '.' || baseName === '..') {
    throw new Error('Invalid file name');
  }
  if (!baseName.toLowerCase().endsWith('.md')) {
    throw new Error('Only .md files are allowed');
  }
  if (baseName.includes('/') || baseName.includes('\\')) {
    throw new Error('Invalid file name');
  }
  return baseName;
}

export async function listAgentSkills(): Promise<AgentSkillSummary[]> {
  const dir = await ensureSkillsDir();
  const entries = await readdir(dir, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'));

  const summaries = await Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(dir, file.name);
      const info = await stat(fullPath);
      return {
        filename: file.name,
        displayName: toDisplayName(file.name),
        updatedAt: info.mtimeMs,
      };
    })
  );

  return summaries.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function listAgentSkillRecords(): Promise<AgentSkillRecord[]> {
  const summaries = await listAgentSkills();
  return Promise.all(
    summaries.map(async (summary) => {
      const buffer = await readFile(path.join(SKILLS_DIR, summary.filename));
      return {
        ...summary,
        contentBinary: buffer.toString('binary'),
      };
    })
  );
}

export async function readAgentSkill(filename: string) {
  const safeName = sanitizeSkillFilename(filename);
  const dir = await ensureSkillsDir();
  const content = await readFile(path.join(dir, safeName));
  return {
    filename: safeName,
    displayName: toDisplayName(safeName),
    contentBinary: content.toString('binary'),
  };
}

export async function writeAgentSkill(filename: string, contentBinary: string) {
  const safeName = sanitizeSkillFilename(filename);
  const dir = await ensureSkillsDir();
  await writeFile(path.join(dir, safeName), Buffer.from(contentBinary, 'binary'));
  return {
    filename: safeName,
    displayName: toDisplayName(safeName),
  };
}

export async function deleteAgentSkill(filename: string) {
  const safeName = sanitizeSkillFilename(filename);
  const dir = await ensureSkillsDir();
  await rm(path.join(dir, safeName), { force: true });
}

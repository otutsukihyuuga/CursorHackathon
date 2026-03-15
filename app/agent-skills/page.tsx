'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';

interface AgentSkillApiRecord {
  id: number;
  user_id: number | null;
  is_public: boolean;
  name: string;
  skill_text_content?: string;
  skill_text_context?: string;
  created_at: string;
}

interface AgentSkillRecord {
  id: number;
  user_id: number | null;
  is_public: boolean;
  name: string;
  skill_text_content: string;
  created_at: string;
}

function normalizeSkillRecord(skill: AgentSkillApiRecord): AgentSkillRecord {
  return {
    id: skill.id,
    user_id: skill.user_id,
    is_public: skill.is_public,
    name: skill.name,
    skill_text_content: skill.skill_text_content ?? skill.skill_text_context ?? '',
    created_at: skill.created_at,
  };
}

export default function AgentSkillsPage() {
  const { user } = useAuth();
  const { loading } = useRequireAuth();
  const [skills, setSkills] = useState<AgentSkillRecord[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedSummary = useMemo(
    () => skills.find((skill) => skill.id === selectedSkillId) ?? null,
    [skills, selectedSkillId]
  );

  const loadSkills = useCallback(async () => {
    if (user?.id == null) return;

    setLoadingList(true);
    setError(null);
    try {
      const res = await fetch(`/users/${encodeURIComponent(String(user.id))}/skills`, {
        headers: {
          'X-User-Id': String(user.id),
        },
      });
      const data = (await res.json()) as AgentSkillApiRecord[] | { error?: string };
      if (!res.ok) {
        throw new Error(
          typeof data === 'object' && !Array.isArray(data) ? (data.error ?? 'Failed to load skills') : 'Failed to load skills'
        );
      }

      const nextSkills = Array.isArray(data) ? data.map(normalizeSkillRecord) : [];
      setSkills(nextSkills);
      setSelectedSkillId((current) => {
        if (current != null && nextSkills.some((skill) => skill.id === current)) {
          return current;
        }
        return nextSkills[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setLoadingList(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!loading && user?.id != null) {
      void loadSkills();
    }
  }, [loading, loadSkills, user?.id]);

  async function handleUpload(file: File | null) {
    if (!file || user?.id == null) return;

    setStatusMessage(null);
    if (!file.name.toLowerCase().endsWith('.md')) {
      setStatusMessage('Please upload a .md file.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const skillText = await file.text();

      const res = await fetch(`/users/${encodeURIComponent(String(user.id))}/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(user.id),
        },
        body: JSON.stringify({
          name: file.name.replace(/\.md$/i, ''),
          skill_text_context: skillText,
          is_public: false,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? 'Failed to create skill');
      }

      const createdSkill = (await res.json().catch(() => null)) as AgentSkillApiRecord | null;

      await loadSkills();
      if (createdSkill?.id != null) {
        setSelectedSkillId(createdSkill.id);
      }
      setStatusMessage(`Uploaded ${file.name}`);
    } catch (err) {
      setStatusMessage(null);
      setError(err instanceof Error ? err.message : 'Failed to create skill');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 bg-slate-50 overflow-hidden">
      <div className="h-full grid grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200 bg-white p-4 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Agent Skills</h1>
              <p className="mt-1 text-sm text-slate-500">
                Upload markdown files, browse available skills, and preview them.
              </p>
            </div>

            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-2">
                Create Skill
              </span>
              <input
                type="file"
                accept=".md,text/markdown"
                disabled={submitting}
                onChange={(e) => {
                  void handleUpload(e.target.files?.[0] ?? null);
                  e.target.value = '';
                }}
                className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium hover:file:bg-slate-200 disabled:opacity-50"
              />
            </label>

            {statusMessage && (
              <p className="text-sm text-green-600">{statusMessage}</p>
            )}

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-slate-700">Available Skills</h2>
                <span className="text-xs text-slate-400">{skills.length}</span>
              </div>

              {loadingList ? (
                <p className="text-sm text-slate-500">Loading skills…</p>
              ) : skills.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No skills yet. Upload a markdown file to create one.
                </div>
              ) : (
                <div className="space-y-1">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className={`rounded-xl border px-3 py-2 transition-colors ${
                        skill.id === selectedSkillId
                          ? 'border-indigo-200 bg-indigo-50'
                          : 'border-transparent bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSkillId(skill.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className={`font-medium truncate ${
                            skill.id === selectedSkillId ? 'text-indigo-900' : 'text-slate-700'
                          }`}>
                            {skill.name}
                          </div>
                          <div className="text-xs text-slate-500 truncate">{skill.name}.md</div>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="min-w-0 overflow-y-auto p-6">
          {selectedSummary ? (
            <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {selectedSummary.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedSummary.name}.md
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Created {new Date(selectedSummary.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <article className="space-y-4 text-sm leading-7 text-slate-700">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-3xl font-semibold text-slate-900">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-semibold text-slate-900">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-semibold text-slate-900">{children}</h3>,
                    p: ({ children }) => <p>{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
                    code: ({ children }) => (
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px] text-slate-800">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {selectedSummary.skill_text_content}
                </ReactMarkdown>
              </article>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-slate-500">
                <p className="font-medium text-slate-700">Select a skill</p>
                <p className="mt-1 text-sm">Choose a markdown skill from the list to preview it.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

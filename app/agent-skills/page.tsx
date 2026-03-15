'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRequireAuth } from '@/hooks/useRequireAuth';

interface AgentSkillRecord {
  filename: string;
  displayName: string;
  updatedAt: number;
  contentBinary: string;
}

export default function AgentSkillsPage() {
  const { loading } = useRequireAuth();
  const [skills, setSkills] = useState<AgentSkillRecord[]>([]);
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const decodeBinaryString = useCallback((binary: string) => {
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }, []);

  const encodeBinaryString = useCallback(async (file: File) => {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }

    return binary;
  }, []);

  const selectedSummary = useMemo(
    () => skills.find((skill) => skill.filename === selectedFilename) ?? null,
    [skills, selectedFilename]
  );

  const loadSkills = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const res = await fetch('/skills/list');
      const data = (await res.json()) as { skills?: AgentSkillRecord[]; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to load skills');
      }

      const nextSkills = data.skills ?? [];
      setSkills(nextSkills);
      setSelectedFilename((current) => {
        if (current && nextSkills.some((skill) => skill.filename === current)) {
          return current;
        }
        return nextSkills[0]?.filename ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      void loadSkills();
    }
  }, [loading, loadSkills]);

  async function handleUpload(file: File | null) {
    if (!file) return;

    setStatusMessage(null);
    if (!file.name.toLowerCase().endsWith('.md')) {
      setStatusMessage('Please upload a .md file.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const contentBinary = await encodeBinaryString(file);

      const res = await fetch('/skills/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentBinary,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? 'Failed to create skill');
      }

      await loadSkills();
      setSelectedFilename(file.name);
      setStatusMessage(`Uploaded ${file.name}`);
    } catch (err) {
      setStatusMessage(null);
      setError(err instanceof Error ? err.message : 'Failed to create skill');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedFilename) return;

    setDeleting(true);
    setError(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/skills/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: selectedFilename }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? 'Failed to delete skill');
      }

      const deletedFilename = selectedFilename;
      await loadSkills();
      setStatusMessage(`Deleted ${deletedFilename}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete skill');
    } finally {
      setDeleting(false);
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
                      key={skill.filename}
                      className={`rounded-xl border px-3 py-2 transition-colors ${
                        skill.filename === selectedFilename
                          ? 'border-indigo-200 bg-indigo-50'
                          : 'border-transparent bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedFilename(skill.filename)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className={`font-medium truncate ${
                            skill.filename === selectedFilename ? 'text-indigo-900' : 'text-slate-700'
                          }`}>
                            {skill.displayName}
                          </div>
                          <div className="text-xs text-slate-500 truncate">{skill.filename}</div>
                        </button>
                        {skill.filename === selectedFilename && (
                          <button
                            type="button"
                            onClick={() => void handleDelete()}
                            disabled={deleting}
                            className="shrink-0 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deleting ? 'Deleting…' : 'Delete'}
                          </button>
                        )}
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
                    {selectedSummary.displayName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedSummary.filename}
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
                  {decodeBinaryString(selectedSummary.contentBinary)}
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

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorToolbar } from './EditorToolbar';

type Props = {
  documentId: string;
  initialTitle: string;
  initialContent: string;
  access: 'owner' | 'shared';
  canShare: boolean;
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function DocumentEditor({
  documentId,
  initialTitle,
  initialContent,
  access,
  canShare,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [shareEmail, setShareEmail] = useState('');
  const [shareMsg, setShareMsg] = useState('');
  const [collaborators, setCollaborators] = useState<
    { id: string; username: string; email: string | null }[]
  >([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef({ title: initialTitle, content: initialContent });

  const persist = useCallback(
    async (nextTitle: string, nextContent: string) => {
      if (
        nextTitle === lastSaved.current.title &&
        nextContent === lastSaved.current.content
      ) {
        return;
      }
      setSaveState('saving');
      try {
        const res = await fetch(`/api/documents/${documentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: nextTitle, content: nextContent }),
        });
        if (!res.ok) throw new Error('Save failed');
        lastSaved.current = { title: nextTitle, content: nextContent };
        setSaveState('saved');
      } catch {
        setSaveState('error');
      }
    },
    [documentId]
  );

  const scheduleSave = useCallback(
    (nextTitle: string, nextContent: string) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(nextTitle, nextContent), 800);
    },
    [persist]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: JSON.parse(initialContent),
    onUpdate: ({ editor: ed }) => {
      const json = JSON.stringify(ed.getJSON());
      setSaveState('idle');
      scheduleSave(title, json);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none min-h-[320px] px-4 py-3 focus:outline-none',
      },
    },
  });

  useEffect(() => {
    fetch(`/api/documents/${documentId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.shares) setCollaborators(data.shares);
      })
      .catch(() => undefined);
  }, [documentId]);

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();
    setShareMsg('');
    const res = await fetch(`/api/documents/${documentId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: shareEmail }),
    });
    const data = await res.json();
    if (!res.ok) {
      setShareMsg(data.error || 'Could not share');
      return;
    }
    setCollaborators((prev) => {
      if (prev.some((u) => u.id === data.sharedWith.id)) return prev;
      return [...prev, data.sharedWith];
    });
    setShareEmail('');
    setShareMsg(`Shared with ${data.sharedWith.email || data.sharedWith.username}`);
  }

  function onTitleBlur() {
    const trimmed = title.trim() || 'Untitled document';
    setTitle(trimmed);
    const json = editor ? JSON.stringify(editor.getJSON()) : initialContent;
    scheduleSave(trimmed, json);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={onTitleBlur}
          className="flex-1 min-w-[200px] text-2xl font-semibold bg-transparent border-b border-slate-600 focus:border-indigo-500 outline-none py-1"
          aria-label="Document title"
        />
        <span
          className={`text-xs px-2 py-1 rounded ${
            access === 'owner' ? 'bg-emerald-900/60 text-emerald-200' : 'bg-amber-900/60 text-amber-200'
          }`}
        >
          {access === 'owner' ? 'Owned by you' : 'Shared with you'}
        </span>
        <span className="text-xs text-slate-400">
          {saveState === 'saving' && 'Saving…'}
          {saveState === 'saved' && 'Saved'}
          {saveState === 'error' && 'Save failed — retry by editing'}
          {saveState === 'idle' && ' '}
        </span>
      </div>

      <div className="rounded-lg border border-slate-600 overflow-hidden bg-slate-900/50">
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>

      {canShare && (
        <section className="mt-8 p-4 rounded-lg border border-slate-600 bg-slate-900/40">
          <h2 className="text-lg font-medium mb-2">Share document</h2>
          <p className="text-sm text-slate-400 mb-3">
            Grant another registered user edit access by email.
          </p>
          <form onSubmit={handleShare} className="flex flex-wrap gap-2">
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="collaborator@example.com"
              className="flex-1 min-w-[220px] px-3 py-2 rounded bg-slate-800 border border-slate-600"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
            >
              Share
            </button>
          </form>
          {shareMsg && <p className="text-sm mt-2 text-slate-300">{shareMsg}</p>}
          {collaborators.length > 0 && (
            <ul className="mt-3 text-sm text-slate-300 list-disc list-inside">
              {collaborators.map((u) => (
                <li key={u.id}>{u.email || u.username}</li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

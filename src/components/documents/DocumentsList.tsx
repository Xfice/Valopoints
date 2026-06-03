'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

type DocRow = {
  id: string;
  title: string;
  updatedAt: string;
  owner: { username: string };
};

type Props = {
  owned: DocRow[];
  shared: DocRow[];
};

export function DocumentsList({ owned, shared }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [creating, setCreating] = useState(false);

  async function createDocument() {
    setCreating(true);
    try {
      const res = await fetch('/api/documents', { method: 'POST' });
      const data = await res.json();
      if (res.ok) router.push(`/documents/${data.id}`);
    } finally {
      setCreating(false);
    }
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    setImporting(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/documents/import', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error || 'Import failed');
        return;
      }
      router.push(`/documents/${data.id}`);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3 items-center">
        <button
          type="button"
          onClick={createDocument}
          disabled={creating}
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm disabled:opacity-50"
        >
          {creating ? 'Creating…' : 'New document'}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="px-4 py-2 rounded border border-slate-500 hover:bg-slate-800 text-sm disabled:opacity-50"
        >
          {importing ? 'Importing…' : 'Import .txt or .md'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,text/plain,text/markdown"
          className="hidden"
          onChange={onFileChange}
        />
        <p className="text-xs text-slate-400 w-full sm:w-auto">
          Supported imports: plain text (.txt) and Markdown (.md), max 512 KB.
        </p>
      </div>
      {importError && <p className="text-sm text-red-400">{importError}</p>}

      <section>
        <h2 className="text-lg font-medium mb-3 text-emerald-300">My documents</h2>
        {owned.length === 0 ? (
          <p className="text-slate-400 text-sm">No documents yet. Create one or import a file.</p>
        ) : (
          <ul className="space-y-2">
            {owned.map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/documents/${doc.id}`}
                  className="block p-3 rounded-lg border border-slate-600 hover:border-indigo-500 bg-slate-900/40"
                >
                  <span className="font-medium">{doc.title}</span>
                  <span className="text-xs text-slate-400 block mt-1">
                    Updated {new Date(doc.updatedAt).toLocaleString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3 text-amber-300">Shared with me</h2>
        {shared.length === 0 ? (
          <p className="text-slate-400 text-sm">
            Documents others share with your account email appear here.
          </p>
        ) : (
          <ul className="space-y-2">
            {shared.map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/documents/${doc.id}`}
                  className="block p-3 rounded-lg border border-amber-900/50 hover:border-amber-500 bg-slate-900/40"
                >
                  <span className="font-medium">{doc.title}</span>
                  <span className="text-xs text-slate-400 block mt-1">
                    Owner: {doc.owner.username} · Updated{' '}
                    {new Date(doc.updatedAt).toLocaleString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

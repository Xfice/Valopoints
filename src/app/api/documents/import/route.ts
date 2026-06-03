import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { emptyEditorContent, textToEditorContent } from '@/lib/documents';

const MAX_BYTES = 512 * 1024;
const ALLOWED = new Set(['text/plain', 'text/markdown', 'application/octet-stream']);

function extensionMime(name: string): string | null {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'txt') return 'text/plain';
  if (ext === 'md' || ext === 'markdown') return 'text/markdown';
  return null;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File must be 512 KB or smaller' }, { status: 400 });
  }

  const mime = file.type || extensionMime(file.name);
  if (!mime || (!ALLOWED.has(mime) && !extensionMime(file.name))) {
    return NextResponse.json(
      { error: 'Supported types: .txt and .md only' },
      { status: 400 }
    );
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext !== 'txt' && ext !== 'md' && ext !== 'markdown') {
    return NextResponse.json(
      { error: 'Supported types: .txt and .md only' },
      { status: 400 }
    );
  }

  const raw = await file.text();
  const titleBase = file.name.replace(/\.[^.]+$/, '') || 'Imported document';
  const content = raw.trim() ? textToEditorContent(raw) : emptyEditorContent();

  const doc = await prisma.document.create({
    data: {
      title: titleBase.slice(0, 200),
      content,
      ownerId: session.userId,
    },
  });

  return NextResponse.json({ id: doc.id, title: doc.title }, { status: 201 });
}

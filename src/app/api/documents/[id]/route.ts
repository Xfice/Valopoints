import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { canEditDocument, getDocumentAccess } from '@/lib/documents';

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await getDocumentAccess(params.id, session.userId);
  if (access === 'none') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, username: true, email: true } },
      shares: {
        include: { user: { select: { id: true, username: true, email: true } } },
      },
    },
  });

  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: doc.id,
    title: doc.title,
    content: doc.content,
    updatedAt: doc.updatedAt,
    access,
    owner: doc.owner,
    shares: doc.shares.map((s) => s.user),
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await canEditDocument(params.id, session.userId))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json();
  const data: { title?: string; content?: string } = {};

  if (typeof body.title === 'string') {
    const title = body.title.trim().slice(0, 200);
    if (!title) {
      return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
    }
    data.title = title;
  }

  if (typeof body.content === 'string') {
    try {
      JSON.parse(body.content);
      data.content = body.content;
    } catch {
      return NextResponse.json({ error: 'Invalid document content' }, { status: 400 });
    }
  }

  if (!data.title && !data.content) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const doc = await prisma.document.update({
    where: { id: params.id },
    data,
    select: { id: true, title: true, updatedAt: true },
  });

  return NextResponse.json(doc);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await getDocumentAccess(params.id, session.userId);
  if (access !== 'owner') {
    return NextResponse.json({ error: 'Only the owner can delete this document' }, { status: 403 });
  }

  await prisma.document.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

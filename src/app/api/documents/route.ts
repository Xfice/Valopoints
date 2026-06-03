import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { emptyEditorContent } from '@/lib/documents';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const owned = await prisma.document.findMany({
    where: { ownerId: session.userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      owner: { select: { username: true } },
    },
  });

  const shared = await prisma.document.findMany({
    where: {
      shares: { some: { userId: session.userId } },
      NOT: { ownerId: session.userId },
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      owner: { select: { username: true } },
    },
  });

  return NextResponse.json({ owned, shared });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let title = 'Untitled document';
  try {
    const body = await req.json();
    if (body?.title && typeof body.title === 'string') {
      title = body.title.trim().slice(0, 200) || title;
    }
  } catch {
    /* empty body is fine */
  }

  const doc = await prisma.document.create({
    data: {
      title,
      content: emptyEditorContent(),
      ownerId: session.userId,
    },
  });

  return NextResponse.json({ id: doc.id, title: doc.title }, { status: 201 });
}

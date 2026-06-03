import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getDocumentAccess } from '@/lib/documents';

type Params = { params: { id: string } };

export async function POST(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await getDocumentAccess(params.id, session.userId);
  if (access !== 'owner') {
    return NextResponse.json({ error: 'Only the owner can share this document' }, { status: 403 });
  }

  const body = await req.json();
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { email } });
  if (!target) {
    return NextResponse.json({ error: 'No user found with that email' }, { status: 404 });
  }
  if (target.id === session.userId) {
    return NextResponse.json({ error: 'You cannot share with yourself' }, { status: 400 });
  }

  const share = await prisma.documentShare.upsert({
    where: {
      documentId_userId: { documentId: params.id, userId: target.id },
    },
    create: { documentId: params.id, userId: target.id },
    update: {},
    include: { user: { select: { id: true, username: true, email: true } } },
  });

  return NextResponse.json({ sharedWith: share.user });
}

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (targetUser.email?.toLowerCase() === adminEmail || targetUser.username === 'admin') {
    return NextResponse.json({ error: 'Cannot remove admin' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.matchRecord.deleteMany({ where: { userId } }),
    prisma.puuidFirstLinked.deleteMany({ where: { userId } }),
    prisma.passwordResetCode.deleteMany({ where: { userId } }),
    prisma.userProfile.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { isValidPassword, PASSWORD_POLICY_MESSAGE } from '@/lib/passwordPolicy';

export async function POST(req: NextRequest) {
  const { email, code, password } = await req.json();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !code || !password) {
    return NextResponse.json({ error: 'Email, code, and password required' }, { status: 400 });
  }
  if (!isValidPassword(String(password))) {
    return NextResponse.json({ error: PASSWORD_POLICY_MESSAGE }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or code' }, { status: 400 });
  }

  const reset = await prisma.passwordResetCode.findFirst({
    where: {
      userId: user.id,
      code: String(code).trim(),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { expiresAt: 'desc' },
  });

  if (!reset) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  }

  const hash = bcrypt.hashSync(password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } }),
    prisma.passwordResetCode.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
  ]);

  return NextResponse.json({ ok: true, message: 'Password updated. You can now log in.' });
}

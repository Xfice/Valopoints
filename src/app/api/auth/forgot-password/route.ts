import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetCode } from '@/lib/email';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    return NextResponse.json({ error: 'No account found with that email' }, { status: 400 });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.passwordResetCode.create({
    data: { userId: user.id, code, expiresAt },
  });

  const sent = await sendPasswordResetCode(normalizedEmail, code);
  if (!sent) {
    return NextResponse.json({ error: 'Failed to send email. Try again later.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: 'Check your email for the reset code' });
}

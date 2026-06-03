import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { isValidPassword, PASSWORD_POLICY_MESSAGE } from '@/lib/passwordPolicy';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();
  if (!username || !email || !password || username.length < 2) {
    return NextResponse.json({ error: 'Username (min 2) and email are required' }, { status: 400 });
  }
  if (!isValidPassword(String(password))) {
    return NextResponse.json({ error: PASSWORD_POLICY_MESSAGE }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }
  try {
    const hash = bcrypt.hashSync(password, 10);
    await prisma.user.create({
      data: { username, email: String(email).trim().toLowerCase(), passwordHash: hash },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if ((e as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Username or email already taken' }, { status: 400 });
    }
    throw e;
  }
}

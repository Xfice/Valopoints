import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getAccount } from '@/services/valorantApi';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
    }

    let body: { riotName?: string; riotTag?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { riotName, riotTag } = body;
  const name = String(riotName || '').trim();
  const tag = String(riotTag || '').trim();
  if (!name || !tag) {
    return NextResponse.json({ error: 'Riot ID and Tag required' }, { status: 400 });
  }

  const acc = await getAccount(name, tag);
  if (!acc.success) return NextResponse.json({ error: acc.error }, { status: 400 });

  const now = new Date();
  let firstLinkedAt = now;

  const firstLinked = await prisma.puuidFirstLinked.findUnique({
    where: { userId_puuid: { userId: session.userId, puuid: acc.puuid } },
  });
  if (firstLinked) firstLinkedAt = firstLinked.firstLinkedAt;
  else {
    await prisma.puuidFirstLinked.create({
      data: { userId: session.userId, puuid: acc.puuid, firstLinkedAt },
    });
  }

  await prisma.userProfile.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      riotName: name,
      riotTag: tag,
      puuid: acc.puuid,
      region: acc.region || 'na',
      linkedAt: firstLinkedAt,
    },
    update: {
      riotName: name,
      riotTag: tag,
      puuid: acc.puuid,
      region: acc.region || 'na',
      linkedAt: firstLinkedAt,
    },
  });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[link] Error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to link account' }, { status: 500 });
  }
}

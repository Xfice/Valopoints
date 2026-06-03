import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getMatchHistory, calculateMatchRecord } from '@/services/valorantApi';
import { applyMonthlyDeduction } from '@/services/pointsCalculator';

export async function POST() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profile = await prisma.userProfile.findUnique({ where: { userId: session.userId } });
  if (!profile) return NextResponse.json({ error: 'Link Riot account first' }, { status: 400 });

  const existingRecords = await prisma.matchRecord.findMany({
    where: { userId: session.userId, puuid: profile.puuid },
    select: { matchId: true, agent: true },
  });
  const existingById = new Map(existingRecords.map((r) => [r.matchId, r]));

  const { success, matches } = await getMatchHistory(profile.puuid, profile.region);
  if (!success || !matches.length) {
    const records = await prisma.matchRecord.findMany({
      where: { userId: session.userId, puuid: profile.puuid, matchPlayedAt: { gte: profile.linkedAt } },
    });
    const total = applyMonthlyDeduction(records.map((r) => ({ pointsEarned: r.pointsEarned, matchPlayedAt: r.matchPlayedAt })));
    return NextResponse.json({ newCount: 0, totalPoints: total });
  }

  const linkedAt = profile.linkedAt;
  let newCount = 0;

  for (const match of matches) {
    const meta = match.metadata as { mode?: string; queue?: { id?: string }; match_id?: string; game_start_patched?: string; started_at?: string };
    const mode = (meta?.mode || meta?.queue?.id || '').toLowerCase();
    if (!mode.includes('competitive') && !mode.includes('ranked')) continue;

    const matchId = meta?.match_id;
    if (!matchId) continue;

    const record = calculateMatchRecord(match as Parameters<typeof calculateMatchRecord>[0], profile.puuid, session.userId);
    if (!record) continue;

    const existing = existingById.get(matchId);

    if (existing) {
      // Backfill agent for existing records that are missing it
      if (!existing.agent?.trim() && record.agent?.trim()) {
        try {
          await prisma.matchRecord.updateMany({
            where: { userId: session.userId, puuid: profile.puuid, matchId },
            data: { agent: record.agent },
          });
        } catch {}
      }
      continue;
    }

    const gameStart = meta?.game_start_patched || meta?.started_at;
    if (gameStart && new Date(gameStart) < linkedAt) continue;

    try {
      await prisma.matchRecord.create({
        data: {
          userId: record.userId,
          puuid: record.puuid,
          matchId: record.matchId,
          agent: record.agent,
          won: record.won,
          kills: record.kills,
          deaths: record.deaths,
          assists: record.assists,
          wasMvp: record.wasMvp,
          wasTeamMvp: record.wasTeamMvp,
          aces: record.aces,
          pointsEarned: record.pointsEarned,
          matchPlayedAt: record.matchPlayedAt,
        },
      });
      existingById.set(matchId, { matchId, agent: record.agent });
      newCount++;
    } catch {}
  }

  const records = await prisma.matchRecord.findMany({
    where: { userId: session.userId, puuid: profile.puuid, matchPlayedAt: { gte: linkedAt } },
  });
  const totalPoints = applyMonthlyDeduction(records.map((r) => ({ pointsEarned: r.pointsEarned, matchPlayedAt: r.matchPlayedAt })));

  return NextResponse.json({ newCount, totalPoints });
}
